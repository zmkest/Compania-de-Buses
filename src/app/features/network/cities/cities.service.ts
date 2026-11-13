import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { City } from './city.dto';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  private readonly apiUrl = `${environment.apiUrl}/cities`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  // Lista completa ordenada por nombre (sin paginar). withTerminals: solo ciudades con al menos un terminal.
  getAll(withTerminals = false): Observable<City[]> {
    const params = withTerminals ? new HttpParams().set('withTerminals', true) : undefined;
    return this.http.get<City[]>(this.apiUrl, { params, context: this.context });
  }
}
