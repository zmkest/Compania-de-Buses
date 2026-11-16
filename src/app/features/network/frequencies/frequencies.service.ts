import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse, SortOrder } from '../../../core/http/paginated';
import { CreateFrequencyDto, UpdateFrequencyDto, EWeekday, Frequency, FrequencyDetail, FrequencyResponse } from './frequency.dto';

export type FrequencySortBy = 'id' | 'departureTime' | 'basePrice';

export interface FrequencyQuery {
  page: number;
  limit: number;
  routeId: number | null;
  weekday: EWeekday | null;
  isActive: boolean | null;
  sortBy: FrequencySortBy;
  order: SortOrder;
}

@Injectable({
  providedIn: 'root'
})
export class FrequenciesService {
  private readonly apiUrl = `${environment.apiUrl}/frequencies`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, routeId, weekday, isActive, sortBy, order }: FrequencyQuery): Observable<PaginatedResponse<FrequencyResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', sortBy).set('order', order);
    if (routeId) {
      params = params.set('routeId', routeId);
    }
    if (weekday) {
      params = params.set('weekday', weekday);
    }
    if (isActive !== null) {
      params = params.set('isActive', isActive);
    }
    return this.http.get<PaginatedResponse<FrequencyResponse>>(this.apiUrl, { params, context: this.context });
  }

  getById(id: number): Observable<FrequencyDetail> {
    return this.http.get<FrequencyDetail>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  create(data: CreateFrequencyDto): Observable<Frequency> {
    return this.http.post<Frequency>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateFrequencyDto): Observable<FrequencyResponse> {
    return this.http.patch<FrequencyResponse>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  updateActive(id: number, isActive: boolean): Observable<FrequencyResponse> {
    return this.http.patch<FrequencyResponse>(`${this.apiUrl}/${id}/active`, { isActive }, { context: this.context });
  }
}
