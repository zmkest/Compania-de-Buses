import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse, SortOrder } from '../../../core/http/paginated';
import { CreateTripDto, ETripStatus, GenerateTripsDto, GenerateTripsResult, TripDetail, TripResponse } from './trip.dto';

export type TripSortBy = 'id' | 'scheduledDeparture' | 'price';

export interface TripQuery {
  page: number;
  limit: number;
  routeId: number | null;
  busPlate: string;
  status: ETripStatus | null;
  from: string | null;
  to: string | null;
  unassigned: boolean | null;
  sortBy: TripSortBy;
  order: SortOrder;
}

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private readonly apiUrl = `${environment.apiUrl}/trips`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, routeId, busPlate, status, from, to, unassigned, sortBy, order }: TripQuery): Observable<PaginatedResponse<TripResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', sortBy).set('order', order);
    if (routeId) {
      params = params.set('routeId', routeId);
    }
    if (busPlate) {
      params = params.set('busPlate', busPlate);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (unassigned !== null) {
      params = params.set('unassigned', unassigned);
    }
    return this.http.get<PaginatedResponse<TripResponse>>(this.apiUrl, { params, context: this.context });
  }

  getById(id: number): Observable<TripDetail> {
    return this.http.get<TripDetail>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  create(data: CreateTripDto): Observable<TripResponse> {
    return this.http.post<TripResponse>(this.apiUrl, data, { context: this.context });
  }

  generate(data: GenerateTripsDto): Observable<GenerateTripsResult> {
    return this.http.post<GenerateTripsResult>(`${this.apiUrl}/generate`, data, { context: this.context });
  }
}
