import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bus } from '../shared/models/Buses';
import { BusResponse, BusStatusHistoryResponse, CreateBusDto, UpdateBusDto, UpdateBusStatusDto } from '../shared/models/bus.dto';
import { EBusStatus } from '../shared/enums/bus.enum';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { PaginatedResponse } from '../core/interfaces/paginated';

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

// Cuántos cambios llevaron a cada estado.
export type BusStatusHistoryStats = { total: number | null } & Record<EBusStatus, number | null>;

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
    return forkJoin({
      total: this.countStatusHistory({}),
      [EBusStatus.AVAILABLE]: this.countStatusHistory({ toStatus: EBusStatus.AVAILABLE }),
      [EBusStatus.ON_ROUTE]: this.countStatusHistory({ toStatus: EBusStatus.ON_ROUTE }),
      [EBusStatus.MAINTENANCE]: this.countStatusHistory({ toStatus: EBusStatus.MAINTENANCE }),
      [EBusStatus.OUT_OF_SERVICE]: this.countStatusHistory({ toStatus: EBusStatus.OUT_OF_SERVICE }),
    });
  }

  private countStatusHistory(filters: Pick<BusStatusHistoryQuery, 'toStatus'>): Observable<number | null> {
    return this.getStatusHistory({ page: 1, limit: 1, ...filters }).pipe(
      map(response => response.meta.total),
      catchError(() => of(null)),
    );
  }

  create(data: CreateBusDto): Observable<BusResponse> {
    return this.http.post<BusResponse>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateBusDto): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  updateStatus(id: number, data: UpdateBusStatusDto): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/${id}/status-history`, data, { context: this.context });
  }

  delete(id: number): Observable<BusResponse> {
    return this.http.delete<BusResponse>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  // Datos locales que aún usan los módulos de viajes y consultas hasta migrarlos a la API.
  private ListaBuses: Bus[] = [
    new Bus(1, "NGH-1548", "Urbano", "Mantenimiento", 1),
    new Bus(2, "XDH-1686", "Provincial", "Disponible", 0),
    new Bus(3, "ASD-9863", "Provincial", "Disponible", 3),
    new Bus(4, "ZXC-9561", "Provincial", "Disponible", 5),
    new Bus(5, "ERT-3256", "Urbano", "Mantenimiento", 2)
  ];

  get getListaBuses(): Bus[] {
    return [...this.ListaBuses];
  }

  actualizarBusViajes(bus: Bus) {
    const indice = this.ListaBuses.findIndex(b => b.codigo === bus.codigo);
    if (indice !== -1) {
      this.ListaBuses[indice].num_viajes += 1;
    }
  }

  actualizarBusEstado(bus: Bus, estado: string) {
    const indice = this.ListaBuses.findIndex(b => b.codigo === bus.codigo);
    if (indice !== -1) {
      this.ListaBuses[indice].estado = estado;
    }
  }
}
