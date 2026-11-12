import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BusResponse, BusStatusHistoryResponse, CreateBusDto, UpdateBusDto, UpdateBusStatusDto } from './bus.dto';
import { EBusStatus } from './bus.enum';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse } from '../../../core/http/paginated';

export interface BusQuery {
  page: number;
  limit: number;
  search?: string;
}

export type BusStats = { total: number } & Record<EBusStatus, number | null>;

export interface BusStatusHistoryQuery extends BusQuery {
  fromStatus?: EBusStatus | null;
  toStatus?: EBusStatus | null;
}

export interface BusAvailabilityQuery {
  startDate: string;
  finishDate: string;
}

// Cuántos cambios llevaron a cada estado.
export type BusStatusHistoryStats = { total: number } & Record<EBusStatus, number>;

@Injectable({
  providedIn: 'root'
})
export class BusesService {
  private readonly apiUrl = `${environment.apiUrl}/buses`;
  private readonly apiUrlStatusH = `${environment.apiUrl}/status-history`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, search }: BusQuery): Observable<PaginatedResponse<BusResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PaginatedResponse<BusResponse>>(this.apiUrl, { params, context: this.context });
  }

  getStats(): Observable<BusStats> {
    return forkJoin({
      total: this.getAll({ page: 1, limit: 1 }).pipe(map(response => response.meta.total)),
      [EBusStatus.AVAILABLE]: this.countByStatus(EBusStatus.AVAILABLE),
      [EBusStatus.ON_ROUTE]: this.countByStatus(EBusStatus.ON_ROUTE),
      [EBusStatus.MAINTENANCE]: this.countByStatus(EBusStatus.MAINTENANCE),
      [EBusStatus.OUT_OF_SERVICE]: this.countByStatus(EBusStatus.OUT_OF_SERVICE),
    });
  }

  countByStatus(status: EBusStatus): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/count/status/${status}`, { context: this.context }).pipe(
      catchError(() => of(null)),
    );
  }

  getStatusHistory({ page, limit, search, fromStatus, toStatus }: BusStatusHistoryQuery): Observable<PaginatedResponse<BusStatusHistoryResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    if (fromStatus) {
      params = params.set('fromStatus', fromStatus);
    }
    if (toStatus) {
      params = params.set('toStatus', toStatus);
    }
    return this.http.get<PaginatedResponse<BusStatusHistoryResponse>>(this.apiUrlStatusH, { params, context: this.context });
  }

  getStatusHistoryStats(): Observable<BusStatusHistoryStats> {
    return this.http.get<BusStatusHistoryStats>(`${this.apiUrlStatusH}/count/to-status`, { context: this.context });
  }

  // Buses AVAILABLE sin viajes activos que se crucen con el rango (fechas en ISO, finishDate > startDate).
  getAvailable({ startDate, finishDate }: BusAvailabilityQuery): Observable<BusResponse[]> {
    const params = new HttpParams().set('startDate', startDate).set('finishDate', finishDate);
    return this.http.get<BusResponse[]>(`${this.apiUrl}/available`, { params, context: this.context });
  }

  create(data: CreateBusDto): Observable<BusResponse> {
    return this.http.post<BusResponse>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateBusDto): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  updateStatus(id: number, data: UpdateBusStatusDto): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, data, { context: this.context });
  }

  delete(id: number): Observable<BusResponse> {
    return this.http.delete<BusResponse>(`${this.apiUrl}/${id}`, { context: this.context });
  }
}
