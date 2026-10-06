import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Bus } from '../../Models/Buses';
import { Tripulacion } from '../../Models/Tripulacion';
import { Viaje } from '../../Models/Viaje';
import { BusesService } from '../../services/buses.service';
import { TripulacionService } from '../../services/tripulacion.service';
import { ViajeService } from '../../services/viaje.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-agregar',
  standalone: false,
  templateUrl: './agregar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnChanges{
  @Input() nuevoViaje: Viaje = new Viaje(0, '', '', '', new Date(), new Bus(0,"","","",0),new Tripulacion(0,0,[]),''); // Ajusta los valores iniciales
  @Input() tipo: boolean = false;
  busSeleccionado: Bus | undefined;
  tripulacionSeleccionado: Tripulacion | undefined;
  miForm: FormGroup;
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;

  @ViewChild('radios', { read: ElementRef, static: false }) radiosRef!: ElementRef;

  constructor(private fb: FormBuilder, private viajeService: ViajeService,  private busServ: BusesService, private tripulaiconServ: TripulacionService) {
    this.miForm = this.fb.group({
      codigo: ['', Validators.required],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      hora: ['', Validators.required],
      fecha: ['', Validators.required],
    });
  }

  get listBus() {
    const bus = this.busServ.getListaBuses.filter(bus => bus.estado == 'Disponible');
    return bus;
  }

  get listTripulacion() {
    return this.tripulaiconServ.getListaTripulaciones;
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  limpiar() {
    this.miForm.reset();
    this.nuevoViaje= new Viaje(0, '', '', '', new Date(), new Bus(0,"","","",0),new Tripulacion(0,0,[]),'');
    this.tipo = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof this.nuevoViaje.fecha === 'string') {
      this.miForm = this.fb.group({
        codigo: [this.nuevoViaje.codigo, Validators.required],
        origen: [this.nuevoViaje.origen, Validators.required],
        destino: [this.nuevoViaje.destino, Validators.required],
        hora: [this.nuevoViaje.hora, Validators.required],
        fecha: [this.nuevoViaje.fecha, Validators.required],
      });
    }else {
      this.miForm = this.fb.group({
        codigo: [this.nuevoViaje.codigo, Validators.required],
        origen: [this.nuevoViaje.origen, Validators.required],
        destino: [this.nuevoViaje.destino, Validators.required],
        hora: [this.nuevoViaje.hora, Validators.required],
        fecha: [this.formatDate(this.nuevoViaje.fecha), Validators.required],
      });
    }

    if (this.nuevoViaje) {
      
      const bus = this.nuevoViaje.bus;
      const tripulacion = this.nuevoViaje.tripulacion;
      this.tripulacionSeleccionado = tripulacion;
      this.busSeleccionado = bus;
    }
  }

  busSelect(bus: Bus) {
    this.busSeleccionado = bus;
  }

  isBusSelected(bus: Bus): boolean {
    return this.busSeleccionado && this.busSeleccionado.codigo === bus.codigo ? true : false;
  }

  tripulacionSelect(tri: Tripulacion) {
    this.tripulacionSeleccionado = tri;
  }

  isTripulacionSelected(tri: Tripulacion): boolean {
    return this.tripulacionSeleccionado && this.tripulacionSeleccionado.codigo === tri.codigo ? true : false;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  
  metodo() {
    if (this.miForm.valid) {
      this.nuevoViaje.codigo = this.miForm.get('codigo')?.value;
      this.nuevoViaje.origen = this.miForm.get('origen')?.value;
      this.nuevoViaje.destino = this.miForm.get('destino')?.value;
      this.nuevoViaje.hora = this.miForm.get('hora')?.value;
      this.nuevoViaje.fecha = this.miForm.get('fecha')?.value;
      if (this.viajeService.getListaViajes.findIndex(viaje => viaje.codigo === this.nuevoViaje.codigo) < 0) {
        this.insertar();
        this.miForm.reset();
        this.title = 'Viajes';
        this.tipoT = 'Agregar';
        this.description = 'Viaje Agregado';
        this.showToast();
      } else {
        this.actualizar();
        this.miForm.reset();
        this.title = 'Viajes';
        this.tipoT = 'Actualizar';
        this.description = 'Viaje Actualizado';
        this.showToast();
      }
    }
  }
  
  insertar() {
    if (this.nuevoViaje.origen.trim().length === 0) {
      return;
    }
    if (this.busSeleccionado && this.tripulacionSeleccionado) {
      console.log(this.nuevoViaje.bus);
      console.log(this.busSeleccionado);
      this.nuevoViaje.bus = this.busSeleccionado;
      this.nuevoViaje.tripulacion = this.tripulacionSeleccionado;
    }
    
    this.viajeService.AgregarViaje(this.nuevoViaje);
    this.busServ.actualizarBusEstado(this.nuevoViaje.bus, 'En Curso');

    this.nuevoViaje = new Viaje(0, '', '', '', new Date(), new Bus(0,"","","",0),new Tripulacion(0,0,[]),''); // Reiniciar valores después de agregar
    this.busSeleccionado = undefined;
    this.tripulacionSeleccionado = undefined;
    this.tipo = false;
    this.viajeService.getListaViajes;
  }
  
  actualizar() {
    if (this.nuevoViaje.origen.trim().length === 0) {
      return;
    }
    if (this.busSeleccionado && this.tripulacionSeleccionado) {
      this.nuevoViaje.bus = this.busSeleccionado;
      this.nuevoViaje.tripulacion = this.tripulacionSeleccionado;
    }
    
    this.viajeService.actualizarViaje(this.nuevoViaje);
    this.busServ.actualizarBusEstado(this.nuevoViaje.bus, 'En Curso');
    this.nuevoViaje = new Viaje(0, '', '', '', new Date(), new Bus(0,"","","",0),new Tripulacion(0,0,[]),''); // Reiniciar valores después de actualizar
    this.busSeleccionado = undefined;
    this.tripulacionSeleccionado = undefined;
    this.tipo = false;
  }

  seleccionarBus(event: any) {
    const codigoBus = +event.target.value;
    this.busSeleccionado = this.listBus.find(bus => bus.codigo === codigoBus);
  }
  
  eliminarBus() {
    this.busSeleccionado = undefined;
  }

  seleccionarTripulacion(event: any) {
    const codigoTri = +event.target.value;
    this.tripulacionSeleccionado = this.listTripulacion.find(tri => tri.codigo === codigoTri);
  }
  
  eliminarTripualcion() {
    this.tripulacionSeleccionado = undefined;
  }

}
