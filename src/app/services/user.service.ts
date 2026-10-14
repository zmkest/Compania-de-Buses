import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserResponse } from '../shared/models/user.dto';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { PaginatedResponse } from '../core/interfaces/paginated';

export interface UserQuery {
    page: number;
    limit: number;
    search?: string;
}

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly apiUrl = `${environment.apiUrl}/user`;
    private readonly http = inject(HttpClient);
    private readonly context = new HttpContext().set(SILENT_ERRORS, true);

    getAll({ page, limit, search }: UserQuery): Observable<PaginatedResponse<UserResponse>> {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<PaginatedResponse<UserResponse>>(this.apiUrl, { params, context: this.context });
    }

    getStats(): Observable<UserStats> {
        return forkJoin({
            total: this.count(),
            active: this.countByStatus(true),
            inactive: this.countByStatus(false),
        });
    }

    count(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count`, { context: this.context });
    }

    countByStatus(isActive: boolean): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count/active/${isActive}`, { context: this.context });
    }
}
