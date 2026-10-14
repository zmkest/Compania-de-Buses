import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isPublic = PUBLIC_ROUTES.some((r) => req.url.includes(r));
  if (!isApi || isPublic) return next(req);

  const withToken = (r: HttpRequest<unknown>, token: string) =>
    r.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const token = auth.getToken();

  return next(token ? withToken(req, token) : req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || !token) return throwError(() => err);

      return auth.refreshToken().pipe(
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
        switchMap((newToken) => next(withToken(req, newToken))),
      );
    }),
  );
};