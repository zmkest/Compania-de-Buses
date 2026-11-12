import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { PaginatedResponse } from '../core/interfaces/paginated';
import { TerminalResponse } from '../shared/models/terminal.dto';

export type SortOrder = 'asc' | 'desc';

export interface TerminalQuery {
  page: number;
  limit: number;
  // Busca por nombre del terminal o de la ciudad.
  search?: string;
  order: SortOrder;
}

@Injectable({
  providedIn: 'root'
})
export class TerminalsService {
  private readonly apiUrl = `${environment.apiUrl}/terminals`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  getAll({ page, limit, search, order }: TerminalQuery): Observable<PaginatedResponse<TerminalResponse>> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', 'name').set('order', order);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PaginatedResponse<TerminalResponse>>(this.apiUrl, { params, context: this.context });
  }
}
