import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { NotificationService } from "../notifications/notification.service";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { catchError, retry, throwError, timer } from "rxjs";
import { toAppError } from "../errors/app-error";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notifications = inject(NotificationService);
    const auth = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        retry({
            count: 2,
            delay: (error, attempt) => req.method === 'GET' && [0, 502, 503, 504].includes(error.status)
                ? timer(attempt * 500)
                : throwError(() => error),
        }),
        catchError((err: HttpErrorResponse) => {
            const appError = toAppError(err);

            if (err.status === 401) {
                auth.logout();
                router.navigate(['/login']);
            }

            const handledLocally = err.status === 400 || err.status === 422;
            const silent = req.context.get(SILENT_ERRORS); // opt-out por petición
            if (!handledLocally && !silent) {
                notifications.error(appError.message);
            }

            console.error(`[HTTP ${err.status}] ${req.method} ${req.url}`);
            return throwError(() => appError);
        }),    
    )
}

export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);