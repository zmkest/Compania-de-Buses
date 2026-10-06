import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chofer } from 'src/app/Models/Chofer';
import { ChoferService } from 'src/app/services/chofer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-agregar',
  standalone: false,
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnChanges {
  @Input() Nuevo: Chofer = {
    codigo: 0,
    cedula: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: new Date(""),
    aniosConduccion: 0
  };
  @Input() tipo: boolean = false;
  choferForm: FormGroup;
  title!: string;
  tipoT!: string;
  description!: string;
  @ViewChild('liveToast') liveToast!: ElementRef;

  constructor(private fb: FormBuilder, private choferService: ChoferService) {
    this.choferForm = this.fb.group({
      codigo: ['', Validators.required],
      cedula: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      aniosConduccion: ['', Validators.required],
    });
  }

  showToast() {
    const toast = new Toast(this.liveToast.nativeElement);
    toast.show();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof this.Nuevo.fechaNacimiento === 'string') {
      this.choferForm = this.fb.group({
        codigo: [this.Nuevo.codigo, Validators.required],
        cedula: [this.Nuevo.cedula, Validators.required],
        nombres: [this.Nuevo.nombres, Validators.required],
        apellidos: [this.Nuevo.apellidos, Validators.required],
        fechaNacimiento: [this.Nuevo.fechaNacimiento, Validators.required],
        aniosConduccion: [this.Nuevo.aniosConduccion, Validators.required],
      });
    } else {
      this.choferForm = this.fb.group({
        codigo: [this.Nuevo.codigo, Validators.required],
        cedula: [this.Nuevo.cedula, Validators.required],
        nombres: [this.Nuevo.nombres, Validators.required],
        apellidos: [this.Nuevo.apellidos, Validators.required],
        fechaNacimiento: [this.formatDate(this.Nuevo.fechaNacimiento), Validators.required],
        aniosConduccion: [this.Nuevo.aniosConduccion, Validators.required],
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  metodo() {
    if (this.choferForm.valid) {
      this.Nuevo = this.choferForm.value;
      if (this.choferService.getListaChoferes.findIndex(chofer => chofer.codigo === this.Nuevo.codigo) < 0) {
        this.Insert();
        this.choferForm.reset();
        this.title = 'Choferes';
        this.tipoT = 'Agregar';
        this.description = 'Chofer Agregado';
        this.showToast();
      } else {
        this.Actualizar();
        this.choferForm.reset();
        this.title = 'Choferes';
        this.tipoT = 'Actualizar';
        this.description = 'Chofer Actualizado';
        this.showToast();
      }
    }
  }

  limpiar() {
    this.choferForm.reset();
    this.Nuevo= {
      codigo: 0,
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: new Date(""),
      aniosConduccion: 0
    };
    this.tipo = false;
  }

  Insert() {
    if (this.Nuevo.nombres.trim().length === 0) {
      return;
    }

    this.choferService.AgregarChofer(this.Nuevo);
    this.Nuevo = {
      codigo: 0,
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: new Date(""),
      aniosConduccion: 0
    };
    this.tipo = false;
  }

  Actualizar() {
    if (this.Nuevo.nombres.trim().length === 0) {
      return;
    }

    this.choferService.actualizarChofer(this.Nuevo);
    this.Nuevo = {
      codigo: 0,
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: new Date(""),
      aniosConduccion: 0
    };
    this.tipo = false;
  }

}
