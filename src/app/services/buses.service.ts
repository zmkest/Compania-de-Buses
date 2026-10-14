import { Injectable } from '@angular/core';
import { Bus } from '../shared/models/Buses';
import { Tripulacion } from '../shared/models/Tripulacion';
import { Chofer } from '../shared/models/Chofer';

@Injectable({
  providedIn: 'root'
})
export class BusesService {

  private ListaBuses: Bus[] = [
    new Bus(1, "NGH-1548", "Urbano", "Mantenimiento", 1),
    new Bus(2, "XDH-1686", "Provincial", "Disponible", 0),
    new Bus(3, "ASD-9863", "Provincial", "Disponible", 3),
    new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
    new Bus(5, "ERT-3256", "Urbano", "Mantenimiento", 2)
];

  constructor() { }

  get getListaBuses(): Bus[] {
    return [...this.ListaBuses];
  }

  AgregarBus(bus: Bus) {
    this.ListaBuses.push(bus);
  }

  actualizarBus(bus: Bus) {
    const indice = this.ListaBuses.findIndex(b => b.codigo === bus.codigo);
    if (indice !== -1) {
      this.ListaBuses[indice] = bus;
    }
  }

  actualizarBusViajes(bus: Bus) {
    const indice = this.ListaBuses.findIndex(b => b.codigo === bus.codigo);
    if (indice !== -1) {
      this.ListaBuses[indice].num_viajes += 1;
    }
  }

  actualizarBusEstado(bus: Bus, estado: string) {
    const indice = this.ListaBuses.findIndex(b => b.codigo === bus.codigo);
    if (indice !== -1) {
      this.ListaBuses[indice].estado = estado;
    }
  }

  eliminarBus(bus: Bus) {
    const indice = this.ListaBuses.indexOf(bus);
    if (indice !== -1) {
      this.ListaBuses.splice(indice, 1);
    }
  }
}
