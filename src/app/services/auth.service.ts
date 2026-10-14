import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../shared/models/User';
import { Router } from '@angular/router';

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

    private readonly currentUserSignal = signal<User | null>(this.readUser());

    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

    register(name: string, email: string, password: string): Observable<String> {
        return this.http.post<String>(`${this.apiUrl}/register`, { name, email, password });
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
        return this.http.post<Omit<AuthResponse, 'user'>>(`${this.apiUrl}/refresh`, {})
            .pipe(
                map(tokens => {
                    localStorage.setItem(this.tokenKey, tokens.access_token);
                    return tokens.access_token;
                }),
                catchError(error => {
                    return throwError(error);
                }),
            );
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({ error: () => {} });
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
