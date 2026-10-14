import { Injectable } from '@angular/core';
import { Viaje } from '../shared/models/Viaje';
import { Bus } from '../shared/models/Buses';
import { Tripulacion } from '../shared/models/Tripulacion';
import { Chofer } from '../shared/models/Chofer';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {

  private ListaViajes: Viaje[] = [
    new Viaje(1, "Quito", "Cuenca", "10:00", new Date("2023-08-31"),
      new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
      new Tripulacion(1, 30, [
        new Chofer(1, "0712345677", "Pedro Juan", "Rodríguez Macas", new Date("1992-08-25"), 1),
        new Chofer(2, "0709876545", "Ana Barbara", "López López", new Date("1988-11-10"), 1),
      ]),
      'Arrivado'
    ),
    new Viaje(2, "Ambato", "Macará", "11:00", new Date("2023-09-01"),
      new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
      new Tripulacion(2, 25, [
        new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
        new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
      ]),
      'Arrivado'
    ),
    new Viaje(3, "Pasaje", "Manta", "12:00", new Date("2023-09-02"),
      new Bus(3, "ASD-9863", "Provincial", "Disponible", 3),
      new Tripulacion(3, 10, [
        new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
        new Chofer(5, "0701112226", "Luis José", "García Nieves", new Date("1993-04-12"), 2),
      ]),
      'Arrivado'
    ),
    new Viaje(4, "Guayaquil", "Sangolquí", "13:00", new Date("2023-09-03"),
      new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
      new Tripulacion(4, 15, [
        new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
        new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
      ]),
      'Arrivado'
    ),
    new Viaje(5, "Pasaje", "La Peaña", "14:00", new Date("2023-09-04"),
      new Bus(5, "ERT-3256", "Urbano", "Mantenimiento", 2),
      new Tripulacion(5, 10, [
        new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
        new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
      ]),
      'Arrivado'
    ),
    new Viaje(6, "Terminar Terrestre Machala", "Puerto Bolivar", "15:00", new Date("2023-09-05"),
      new Bus(1, "NGH-1548", "Urbano", "Mantenimiento", 1),
      new Tripulacion(6, 14, [
        new Chofer(5, "0701112226", "Luis José", "García Nieves", new Date("1993-04-12"), 2),
        new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
      ]),
      'Arrivado'
    ),
    new Viaje(7, "Machala", "Portoviejo", "16:00", new Date("2023-09-06"),
      new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
      new Tripulacion(1, 30, [
        new Chofer(1, "0712345677", "Pedro Juan", "Rodríguez Macas", new Date("1992-08-25"), 1),
        new Chofer(2, "0709876545", "Ana Barbara", "López López", new Date("1988-11-10"), 1),
      ]),
      'Arrivado'
    ),
    new Viaje(8, "Esmeraldas", "Quevedo", "17:00", new Date("2023-09-07"),
      new Bus(3, "ASD-9863", "Provincial", "Disponible", 3),
      new Tripulacion(2, 25, [
        new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
        new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
      ]),
      'Arrivado'
    ),
    new Viaje(9, "Salinas", "Tena", "18:00", new Date("2023-09-08"),
      new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
      new Tripulacion(4, 15, [
        new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
        new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
      ]),
      'Arrivado'
    ),
    new Viaje(10, "Buenavista", "Pasaje", "19:00", new Date("2023-09-09"),
      new Bus(5, "ERT-3256", "Urbano", "Mantenimiento", 2),
      new Tripulacion(5, 10, [
        new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
        new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
      ]),
      'Arrivado'
    ),
    new Viaje(11, "Loja", "Durán", "21:00", new Date("2023-09-11"),
      new Bus(3, "ASD-9863", "Provincial", "Disponible", 3),
      new Tripulacion(1, 30, [
        new Chofer(1, "0712345677", "Pedro Juan", "Rodríguez Macas", new Date("1992-08-25"), 1),
        new Chofer(2, "0709876545", "Ana Barbara", "López López", new Date("1988-11-10"), 1),
      ]),
      'Arrivado'
    ),
  ];

  constructor() { }

  get getListaViajes(): Viaje[] {
    return [...this.ListaViajes];
  }

  AgregarViaje(viaje: Viaje) {
    this.ListaViajes.push(viaje);
  }

  actualizarViaje(viaje: Viaje) {
    const indice = this.ListaViajes.findIndex(v => v.codigo === viaje.codigo);
    if (indice !== -1) {
      this.ListaViajes[indice] = viaje;
    }
  }

  eliminarViaje(viaje: Viaje) {
    const indice = this.ListaViajes.indexOf(viaje);
    if (indice !== -1) {
      this.ListaViajes.splice(indice, 1);
    }
  }

  actualizarViajesEstado(viaje: Viaje, estado: string) {
    const indice = this.ListaViajes.findIndex(v => v.codigo === viaje.codigo);
    if (indice !== -1) {
      this.ListaViajes[indice].estado = estado;
    }
  }
}
