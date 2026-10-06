import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Bus } from '../../Models/Buses';
import { Chofer } from '../../Models/Chofer';
import { Tripulacion } from '../../Models/Tripulacion';
import { Viaje } from '../../Models/Viaje';
import { BusesService } from '../../services/buses.service';
import { ViajeService } from '../../services/viaje.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-listar',
  standalone: false,
  templateUrl: './listar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./listar.component.css']
})
export class ListarComponent  implements OnInit {
  update!: boolean;
  newViaje: Viaje = {
    codigo: 12,
    origen: 'Quito',
    destino: 'Peru',
    hora: '08:00',
    fecha: new Date('2023-10-01'),
    bus: new Bus(2, "XDH-1686", "Provincial", "Disponible", 0),
    tripulacion: new Tripulacion(7, 14, [
      new Chofer(7, "0705556668", "Diego Armando", "Maradona Ramírez", new Date("1989-06-22"), 1)
      ]),
    estado: "En Curso"
  };
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;
  
  get ListaViajes() {
    return this.viajeService.getListaViajes;
  }

  constructor(private viajeService: ViajeService, private busServ: BusesService) { }

  ngOnInit() {
    this.update = false;
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  editarViaje(viaje: Viaje) {
    if (viaje.estado === 'Arrivado') {
      this.title = 'Viajes';
      this.tipoT = 'Actualizar';
      this.description = 'Viaje ya cuncluyo, no es posible editar';
      this.showToast();
    }else {
      this.update = true;
      this.newViaje = { ...viaje };
    }
  }

  eliminarViaje(viaje: Viaje) {
    if (viaje.estado === 'Arrivado') {
      this.title = 'Viajes';
      this.tipoT = 'Eliminar';
      this.description = 'Viaje ya cuncluyo, no es posible eliminar';
      this.showToast();
    }else {
      this.viajeService.eliminarViaje(viaje);
      this.busServ.actualizarBusEstado(viaje.bus, 'Disponible');
      this.title = 'Viajes';
      this.tipoT = 'Eliminar';
      this.description = 'Viaje eliminado';
      this.showToast();
    }
  }

  TerminarViaje(viaje: Viaje) {
    if (viaje.estado != 'Arrivado'){
      this.viajeService.actualizarViajesEstado(viaje, 'Arrivado');
      this.busServ.actualizarBusEstado(viaje.bus, 'Disponible');
      this.busServ.actualizarBusViajes(viaje.bus);
      this.title = 'Viajes';
      this.tipoT = 'Estado';
      this.description = 'Viaje Arrivado';
      this.showToast();
    }else {
      this.title = 'Viajes';
      this.tipoT = 'Estado';
      this.description = 'Viaje ya cuncluyo, no es posible eliminar';
      this.showToast();
    }    
  }
}
