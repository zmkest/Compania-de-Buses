import { ChoferService } from 'src/app/services/chofer.service';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Tripulacion } from 'src/app/Models/Tripulacion';
import { TripulacionService } from 'src/app/services/tripulacion.service';
import { Chofer } from 'src/app/Models/Chofer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-agregar',
  standalone: false,
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnChanges{
  @Input() nuevaTripulacion: Tripulacion = new Tripulacion(0,0, []); // Ajusta los valores iniciales
  @Input() tipo: boolean = false;
  choferesSeleccionados: Chofer[] = [];
  @ViewChild('checkboxes', { read: ElementRef, static: false }) checkboxesRef!: ElementRef;
  miForm: FormGroup;
  
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;
  
  constructor(private fb: FormBuilder, private tripulacionService: TripulacionService, private choferServ: ChoferService) {
    this.miForm = this.fb.group({
      codigo: ['', Validators.required],
      personas: ['', Validators.required],
    });
  }
  
  get listChofer() {
    return this.choferServ.getListaChoferes;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.miForm = this.fb.group({
      codigo: [this.nuevaTripulacion.codigo, Validators.required],
      personas: [this.nuevaTripulacion.personas, Validators.required],
    });
    if (this.nuevaTripulacion) {
      const arrayChofer = [...this.nuevaTripulacion.choferes]; // Clonar el array
      this.choferesSeleccionados = arrayChofer;
    }
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }
  
  limpiar() {
    this.miForm.reset();
    this.nuevaTripulacion= new Tripulacion(0,0, []);
    this.tipo = false;
  }

  choferSelect(chofer: Chofer) {
    const index = this.choferesSeleccionados.findIndex(c => c.codigo === chofer.codigo);

    if (index === -1) {
        // Si el chofer no está en el arreglo, lo agregamos
        this.choferesSeleccionados.push(chofer);
    } else {
        // Si el chofer ya está en el arreglo, lo eliminamos
        this.choferesSeleccionados.splice(index, 1);
    }
  }

  isChoferSelected(chofer: Chofer): boolean {
    return this.nuevaTripulacion.choferes.some(c => c.codigo === chofer.codigo);
  }

  metodo() {
    if (this.miForm.valid) {
      this.nuevaTripulacion.codigo = this.miForm.get('codigo')?.value;
      this.nuevaTripulacion.personas = this.miForm.get('personas')?.value;
      if (this.tripulacionService.getListaTripulaciones.findIndex(tripulacion => tripulacion.codigo === this.nuevaTripulacion.codigo) < 0) {
        this.insertar();
        this.miForm.reset();
        this.title = 'Tripulación';
        this.tipoT = 'Agregar';
        this.description = 'Tripulación Agregado';
        this.showToast();
      } else {
        this.actualizar();
        this.miForm.reset();
        this.title = 'Tripulación';
        this.tipoT = 'Actualizar';
        this.description = 'Tripulación Actualizado';
        this.showToast();
      }
    }
  }
  desmarcarChoferes() {
    this.choferesSeleccionados = [];
  }
  
  insertar() {
    if (this.nuevaTripulacion.choferes.length < 0) {
      return;
    }
  
    const arrayChofer = [...this.choferesSeleccionados]; // Clonar el array
    this.nuevaTripulacion.choferes = arrayChofer;
  
    this.tripulacionService.AgregarTripulacion(this.nuevaTripulacion);
    this.nuevaTripulacion = new Tripulacion(0,0, []); // Reiniciar valores después de agregar
    this.choferesSeleccionados = []; // Limpiar el array de choferesAgregados
    this.tipo = false;
    // Desmarcar checkboxes
    const checkboxes = this.checkboxesRef.nativeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });
  }
  
  actualizar() {
    if (this.nuevaTripulacion.choferes.length < 0) {
      return;
    }
    const arrayChofer = [...this.choferesSeleccionados]; // Clonar el array
    this.nuevaTripulacion.choferes = arrayChofer;
    this.tripulacionService.actualizarTripulacion(this.nuevaTripulacion);
    this.nuevaTripulacion = new Tripulacion(0,0, []); // Reiniciar valores después de actualizar
    this.choferesSeleccionados  = []; // Limpiar el array de choferesAgregados
    this.tipo = false;
    // Desmarcar checkboxes
    const checkboxes = this.checkboxesRef.nativeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });
  }
}
