import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { PaginatedResponse, SortOrder } from '../../../core/http/paginated';
import { CreateTerminalDto, TerminalDetail, TerminalResponse, UpdateTerminalDto } from './terminal.dto';
import { City } from '../cities/city.dto';

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

  // La API no filtra por cityId: se busca por el nombre de la ciudad (máximo permitido: 50) y se descartan
  // los terminales de otras ciudades cuyo nombre también coincida.
  getByCity(city: City): Observable<TerminalResponse[]> {
    return this.getAll({ page: 1, limit: 50, search: city.name, order: 'asc' }).pipe(
      map(response => response.items.filter(terminal => terminal.cityId === city.id)),
    );
  }

  getById(id: number): Observable<TerminalDetail> {
    return this.http.get<TerminalDetail>(`${this.apiUrl}/${id}`, { context: this.context });
  }

  create(data: CreateTerminalDto): Observable<TerminalResponse> {
    return this.http.post<TerminalResponse>(this.apiUrl, data, { context: this.context });
  }

  update(id: number, data: UpdateTerminalDto): Observable<TerminalDetail> {
    return this.http.patch<TerminalDetail>(`${this.apiUrl}/${id}`, data, { context: this.context });
  }

  // 409 si alguna ruta usa el terminal como origen o destino.
  delete(id: number): Observable<TerminalResponse> {
    return this.http.delete<TerminalResponse>(`${this.apiUrl}/${id}`, { context: this.context });
  }
}
