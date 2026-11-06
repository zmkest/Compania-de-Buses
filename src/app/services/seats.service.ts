import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { PaginatedResponse } from '../core/interfaces/paginated';
import { BusSeatCount } from '../shared/models/seat.dto';

export interface SeatBusQuery {
  page: number;
  limit: number;
  // Solo filtra por placa.
  search?: string;
}

// La API devuelve el conteo de asientos en `_count`.
type BusSeatCountApi = Omit<BusSeatCount, 'seatCount'> & { _count: number };

@Injectable({
  providedIn: 'root'
})
export class SeatsService {
  private readonly apiUrl = `${environment.apiUrl}/seats`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getBuses({ page, limit, search }: SeatBusQuery): Observable<PaginatedResponse<BusSeatCount>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PaginatedResponse<BusSeatCountApi>>(`${this.apiUrl}/bus`, { params, context: this.context }).pipe(
      map(response => ({
        ...response,
        items: response.items.map(({ _count, ...bus }) => ({ ...bus, seatCount: _count })),
      })),
    );
  }
}
