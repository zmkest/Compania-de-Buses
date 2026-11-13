import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse, SortOrder } from '../../../core/http/paginated';
import { CreateRouteDto, RouteDetail, RouteResponse, UpdateRouteDto } from './route.dto';

export type RouteSortBy = 'id' | 'distanceKm' | 'durationMinutes';

export interface RouteQuery {
  page: number;
  limit: number;
  originCityId: number | null;
  destinationCityId: number | null;
  sortBy: RouteSortBy;
  order: SortOrder;
}

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private readonly apiUrl = `${environment.apiUrl}/routes`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, originCityId, destinationCityId, sortBy, order }: RouteQuery): Observable<PaginatedResponse<RouteResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', sortBy).set('order', order);
    if (originCityId) {
      params = params.set('originCityId', originCityId);
    }
    if (destinationCityId) {
      params = params.set('destinationCityId', destinationCityId);
    }
    return this.http.get<PaginatedResponse<RouteResponse>>(this.apiUrl, { params, context: this.context });
  }

  getById(id: number): Observable<RouteDetail> {
    return this.http.get<RouteDetail>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  // 409 si ya existe una ruta con el mismo origen y destino.
  create(data: CreateRouteDto): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateRouteDto): Observable<RouteResponse> {
    return this.http.patch<RouteResponse>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  // 409 si la ruta tiene frecuencias o viajes.
  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, { context: this.context });
  }
}
