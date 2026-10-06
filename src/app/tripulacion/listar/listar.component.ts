import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Tripulacion } from '../../Models/Tripulacion';
import { TripulacionService } from '../../services/tripulacion.service';
import { Toast } from 'bootstrap';
import { AgregarComponent } from '../agregar/agregar.component';

@Component({
    selector: 'app-listar',
    templateUrl: './listar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./listar.component.css'],
    imports: [AgregarComponent]
})
export class ListarComponent implements OnInit {
  update!: boolean;
  newTripulacion: Tripulacion = {
    codigo: 8,
    personas: 20,
    choferes: [], // Ajusta esto según tu implementación
  };
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;
  
  get ListaTripulaciones() {
    return this.tripulacionService.getListaTripulaciones;
  }

  constructor(private tripulacionService: TripulacionService) { }

  ngOnInit() {
    this.update = false;
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  editarTripulacion(tripulacion: Tripulacion) {
    this.update = true;
    this.newTripulacion = { ...tripulacion };
  }

  eliminarTripulacion(tripulacion: Tripulacion) {
    this.tripulacionService.eliminarTripulacion(tripulacion);
    this.title = 'Tripulación';
    this.tipoT = 'Eliminar';
    this.description = 'Tripulación Eliminada';
    this.showToast();
  }
}
