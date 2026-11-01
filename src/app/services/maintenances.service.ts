import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CompleteMaintenanceDto, MaintenanceResponse, MaintenanceStatusStats, UpdateMaintenanceDto } from '../shared/models/maintenance.dto';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { PaginatedResponse } from '../core/interfaces/paginated';

export interface MaintenanceQuery {
  page: number;
  limit: number;
  // Placa del bus o tipo de mantenimiento.
  search?: string;
  // YYYY-MM-DD, filtran por startedAt (endDate incluye el día completo).
  startDate?: string | null;
  endDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenancesService {
  private readonly apiUrl = `${environment.apiUrl}/maintenances`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, search, startDate, endDate }: MaintenanceQuery): Observable<PaginatedResponse<MaintenanceResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<PaginatedResponse<MaintenanceResponse>>(this.apiUrl, { params, context: this.context });
  }

  getStatusStats(): Observable<MaintenanceStatusStats> {
    return this.http.get<MaintenanceStatusStats>(`${this.apiUrl}/count/status`, { context: this.context });
  }

  update(id: number, data: UpdateMaintenanceDto): Observable<MaintenanceResponse> {
    return this.http.patch<MaintenanceResponse>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  // Cierra un mantenimiento en curso y deja el bus disponible.
  complete(id: number, data: CompleteMaintenanceDto): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/complete`, data, { context: this.context });
  }

  // Cancela un mantenimiento en curso y devuelve el bus a su estado anterior.
  cancel(id: number): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, null, { context: this.context });
  }
}
