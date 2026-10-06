import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgregarComponent } from './agregar/agregar.component';
import { ListarComponent } from './listar/listar.component';
import { PrincipalComponent } from './principal/principal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusesService } from '../services/buses.service';



@NgModule({
    exports: [
        ListarComponent, AgregarComponent, PrincipalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ListarComponent,
        AgregarComponent,
        PrincipalComponent
    ],
    providers: [
        BusesService
    ]
})
export class BusesModule { }
