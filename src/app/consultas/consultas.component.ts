import { Component } from '@angular/core';
import { BusesService } from '../services/buses.service';
import { ViajeService } from '../services/viaje.service';

@Component({
  selector: 'app-consultas',
  standalone: false,
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})
export class ConsultasComponent {
  buscarPlaca: string = '';

  constructor(private busService: BusesService, private viajesServ: ViajeService) { }
  
  get ListaBuses() {
    return this.busService.getListaBuses;
  }

  filtrarPorPlaca() {
    return this.ListaBuses.filter((bus) =>
      bus.placa.toLowerCase().includes(this.buscarPlaca.toLowerCase())
    );
  }

  numViajes(): number {
    const numviajes = this.viajesServ.getListaViajes.filter(viaje => viaje.estado === 'Arrivado').length;
  
    return numviajes;
  }
  
  calcularPromedio(num: number): string {
    const numviajes = this.viajesServ.getListaViajes.filter(viaje => viaje.estado === 'Arrivado').length;
    const promedio = num / numviajes * 100;
  
    if (isNaN(promedio) || promedio < 0 || !isFinite(promedio)) {
      return '';
    }
  
    return promedio.toFixed(2);
  }
  
}
