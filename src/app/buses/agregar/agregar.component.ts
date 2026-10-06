import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Toast } from 'bootstrap';
import { Bus } from '../../Models/Buses';
import { BusesService } from '../../services/buses.service';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./agregar.component.css'],
    imports: [FormsModule, ReactiveFormsModule]
})
export class AgregarComponent implements OnChanges{
  @Input() Nuevo: Bus = new Bus(0, '', '', '',0); // Ajusta los valores iniciales
  @Input() tipo: boolean = false;
  miFormulario: FormGroup;
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;
  
  constructor(private fb: FormBuilder, private busService: BusesService) {
    this.miFormulario = this.fb.group({
      codigo: ['', Validators.required],
      placa: ['', Validators.required],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.miFormulario.patchValue({
      codigo: this.Nuevo.codigo,
      placa: this.Nuevo.placa,
      tipo: this.Nuevo.tipo,
      estado: this.Nuevo.estado,
    });
  }
  
  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  metodo() {
    if (this.miFormulario.valid) {
      const viajes = this.Nuevo.num_viajes;
      this.Nuevo = this.miFormulario.value;
      this.Nuevo.num_viajes = viajes;
      if (this.busService.getListaBuses.findIndex(bus => bus.codigo === this.Nuevo.codigo) < 0) {
        this.insertar();
        this.miFormulario.reset();
        this.title = 'Buses';
        this.tipoT = 'Agregar';
        this.description = 'Bus Agregado';
        this.showToast();
      } else {
        this.actualizar();
        this.miFormulario.reset();
        this.title = 'Buses';
        this.tipoT = 'Actualizar';
        this.description = 'Bus Actualizado';
        this.showToast();
      }
    }    
  }
  
  limpiar() {
    this.miFormulario.reset();
    this.Nuevo= new Bus(0, '', '', '',0);
    this.tipo = false;
  }

  insertar() {
    if (this.Nuevo.placa.trim().length === 0) {
      return;
    }
  
    this.busService.AgregarBus(this.Nuevo);
    this.Nuevo = new Bus(0, '', '', '',0); // Reiniciar valores después de agregar
    this.tipo = false;
  }
  
  actualizar() {
    if (this.Nuevo.placa.trim().length === 0) {
      return;
    }
  
    this.busService.actualizarBus(this.Nuevo);
    this.Nuevo = new Bus(0, '', '', '',0); // Reiniciar valores después de actualizar
    this.tipo = false;
  }
}
