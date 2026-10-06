import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';
import { ConsultasComponent } from './consultas/consultas.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ConsultasComponent
  ],
  imports: [
    BrowserModule,
    AdminModule,
    FormsModule
  ],
  providers: [provideZoneChangeDetection()],
  bootstrap: [AppComponent]
})
export class AppModule { }
