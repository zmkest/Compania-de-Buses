import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { City } from './terminal.dto';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  private readonly apiUrl = `${environment.apiUrl}/cities`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  // Lista completa ordenada por nombre (sin paginar).
  getAll(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl, { context: this.context });
  }
}
