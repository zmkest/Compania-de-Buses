import { Injectable } from '@angular/core';
import { Tripulacion } from '../shared/models/Tripulacion';
import { Chofer } from '../shared/models/Chofer';

@Injectable({
  providedIn: 'root'
})
export class TripulacionService {

  private ListaTripulaciones: Tripulacion[] = [
    new Tripulacion(1, 30, [
      new Chofer(1, "0712345677", "Pedro Juan", "Rodríguez Macas", new Date("1992-08-25"), 1),
      new Chofer(2, "0709876545", "Ana Barbara", "López López", new Date("1988-11-10"), 1),
    ]),
    new Tripulacion(2, 25, [
      new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
      new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
    ]),
    new Tripulacion(3, 10, [
      new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
      new Chofer(5, "0701112226", "Luis José", "García Nieves", new Date("1993-04-12"), 2),
    ]),
    new Tripulacion(4, 15, [
      new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
      new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
    ]),
    new Tripulacion(5, 10, [
      new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
      new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
    ]),
    new Tripulacion(6, 14, [
      new Chofer(5, "0701112226", "Luis José", "García Nieves", new Date("1993-04-12"), 2),
      new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
    ]),
    new Tripulacion(7, 14, [
    new Chofer(7, "0705556668", "Diego Armando", "Maradona Ramírez", new Date("1989-06-22"), 1)
    ]),
  ];
     
  constructor() { }

  get getListaTripulaciones(): Tripulacion[] {
    return [...this.ListaTripulaciones];
  }

  AgregarTripulacion(tripulacion: Tripulacion) {
    this.ListaTripulaciones.push(tripulacion);
  }

  actualizarTripulacion(tripulacion: Tripulacion) {
    const indice = this.ListaTripulaciones.findIndex(t => t.codigo === tripulacion.codigo);
    if (indice !== -1) {
      this.ListaTripulaciones[indice] = tripulacion;
    }
  }

  eliminarTripulacion(tripulacion: Tripulacion) {
    const indice = this.ListaTripulaciones.indexOf(tripulacion);
    if (indice !== -1) {
      this.ListaTripulaciones.splice(indice, 1);
    }
  }
}
