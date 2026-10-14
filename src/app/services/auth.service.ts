import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, finalize, map, Observable, shareReplay, throwError } from 'rxjs';
import { SILENT_ERRORS } from '../core/http/error.interceptor';
import { environment } from '../../environments/environment';
import { User } from '../shared/models/User';
import { Router } from '@angular/router';
import { EUserRole } from '../shared/enums/user.enum';

interface AuthResponse {
    access_token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly tokenKey = 'access_token';
    private readonly userKey = 'user';

    private refreshInFlight: Observable<string> | null = null;

    private readonly currentUserSignal = signal<User | null>(this.readUser());

    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

    register(name: string, email: string, password: string): Observable<String> {
        return this.http.post<String>(`${this.apiUrl}/register`, { name, email, password });
    }

    registerByAdmin(name: string, email: string, role: EUserRole): Observable<unknown> {
        return this.http.post(`${this.apiUrl}/users`, { name, email, role }, {
            context: new HttpContext().set(SILENT_ERRORS, true),
        });
    }

    login(email: string, password: string): Observable<void> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
            .pipe(
                map(authResponse => {
                    this.startSession(authResponse);
                }),
                catchError(error => {
                    return throwError(error);
                }),
            );
    }

    refreshToken(): Observable<string> {
        this.refreshInFlight ??= this.http.post<Omit<AuthResponse, 'user'>>(
            `${this.apiUrl}/refresh`, {},
            { withCredentials: true, context: new HttpContext().set(SILENT_ERRORS, true) },
        ).pipe(
            map(tokens => {
                localStorage.setItem(this.tokenKey, tokens.access_token);
                return tokens.access_token;
            }),
            finalize(() => this.refreshInFlight = null),
            shareReplay(1),
        );
        return this.refreshInFlight;
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, {
            withCredentials: true,
            context: new HttpContext().set(SILENT_ERRORS, true),
        }).subscribe({ error: () => {} });
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);

    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private startSession(response: AuthResponse): void {
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
    }

    private readUser(): User | null {
        const raw = localStorage.getItem(this.userKey);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as User;
    }

}
