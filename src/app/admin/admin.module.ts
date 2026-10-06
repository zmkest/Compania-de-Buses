import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BusesModule } from '../buses/buses.module';
import { ChoferModule } from '../chofer/chofer.module';
import { TripulacionModule } from '../tripulacion/tripulacion.module';
import { ViajeModule } from '../viaje/viaje.module';



@NgModule({
    imports: [
        CommonModule,
        BusesModule,
        ChoferModule,
        TripulacionModule,
        ViajeModule,
        AdminComponent,
        SidebarComponent,
    ],
    exports: [
        AdminComponent
    ]
})
export class AdminModule { }
