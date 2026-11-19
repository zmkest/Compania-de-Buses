import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse, SortOrder } from '../../../core/http/paginated';
import { CreateRotationDto, Rotation, RotationDetail, RotationResponse, UpdateRotationDto, UpdatedRotation } from './rotation.dto';

export type RotationSortBy = 'id' | 'name' | 'createdAt';

export interface RotationQuery {
  page: number;
  limit: number;
  busId: number | null;
  isActive: boolean | null;
  sortBy: RotationSortBy;
  order: SortOrder;
}

@Injectable({
  providedIn: 'root'
})
export class RotationsService {
  private readonly apiUrl = `${environment.apiUrl}/rotations`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, busId, isActive, sortBy, order }: RotationQuery): Observable<PaginatedResponse<RotationResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', sortBy).set('order', order);
    if (busId) {
      params = params.set('busId', busId);
    }
    if (isActive !== null) {
      params = params.set('isActive', isActive);
    }
    return this.http.get<PaginatedResponse<RotationResponse>>(this.apiUrl, { params, context: this.context });
  }

  getById(id: number): Observable<RotationDetail> {
    return this.http.get<RotationDetail>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  create(data: CreateRotationDto): Observable<Rotation> {
    return this.http.post<Rotation>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateRotationDto): Observable<UpdatedRotation> {
    return this.http.patch<UpdatedRotation>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  updateActive(id: number, isActive: boolean): Observable<RotationDetail> {
    return this.http.patch<RotationDetail>(`${this.apiUrl}/${id}/active`, { isActive }, { context: this.context });
  }
}
