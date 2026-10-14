import { Injectable } from '@angular/core';
import { Chofer } from '../shared/models/Chofer';

@Injectable({
  providedIn: 'root'
})
export class ChoferService {

  private ListaChoferes: Chofer[] = [
    new Chofer(1, "0712345677", "Pedro Juan", "Rodríguez Macas", new Date("1992-08-25"), 1),
    new Chofer(2, "0709876545", "Ana Barbara", "López López", new Date("1988-11-10"), 1),
    new Chofer(3, "0701234562", "Carlos Luis", "Martínez Pinzon", new Date("1995-02-17"), 3),
    new Chofer(4, "0798765434", "Sofía Pamela", "Hernández Veliz", new Date("1987-07-05"), 3),
    new Chofer(5, "0701112226", "Luis José", "García Nieves", new Date("1993-04-12"), 2),
    new Chofer(6, "0703334445", "Laura Brithani", "Castro Pérez", new Date("1991-09-28"), 2),
    new Chofer(7, "0705556668", "Diego Armando", "Maradona Ramírez", new Date("1989-06-22"), 1)
];


  constructor() { }

  get getListaChoferes(): Chofer[] {
    return [...this.ListaChoferes];
  }

  AgregarChofer(chofer: Chofer) {
    this.ListaChoferes.push(chofer);
  }

  actualizarChofer(chofer: Chofer) {
    const indice = this.ListaChoferes.findIndex(c => c.codigo === chofer.codigo);
    if (indice !== -1) {
      this.ListaChoferes[indice] = chofer;
    }
  }

  eliminarChofer(chofer: Chofer) {
    const indice = this.ListaChoferes.indexOf(chofer);
    if (indice !== -1) {
      this.ListaChoferes.splice(indice, 1);
    }
  }
}
