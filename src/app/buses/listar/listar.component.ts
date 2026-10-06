import { Tripulacion } from 'src/app/Models/Tripulacion';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Bus } from 'src/app/Models/Buses';
import { BusesService } from 'src/app/services/buses.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-listar',
  standalone: false,
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {
  update!: boolean;
  newBus: Bus = {
    codigo: 6,
    placa: 'GJH-2564',
    tipo: 'Provincial',
    estado: 'Disponible',
    num_viajes: 0
  };
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;
  
  get ListaBuses() {
    return this.busService.getListaBuses;
  }

  constructor(private busService: BusesService) { }

  ngOnInit() {
    this.update = false;
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  editarBus(bus: Bus) {
    this.update = true;
    this.newBus = { ...bus };
  }

  eliminarBus(bus: Bus) {
    this.busService.eliminarBus(bus);
    this.title = 'Buses';
    this.tipoT = 'Eliminar';
    this.description = 'Bus Eliminado';
    this.showToast();
  }
}
