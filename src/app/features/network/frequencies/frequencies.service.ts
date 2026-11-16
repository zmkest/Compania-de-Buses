import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SILENT_ERRORS } from '../../../core/http/error.interceptor';
import { CreateFrequencyDto, Frequency } from './frequency.dto';

@Injectable({
  providedIn: 'root'
})
export class FrequenciesService {
  private readonly apiUrl = `${environment.apiUrl}/frequencies`;
  private readonly http = inject(HttpClient);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  create(data: CreateFrequencyDto): Observable<Frequency> {
    return this.http.post<Frequency>(this.apiUrl, data, { context: this.context });
  }
}
