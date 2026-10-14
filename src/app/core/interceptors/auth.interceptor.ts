import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];
const NO_REFRESH_ROUTES = ['/auth/logout'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isPublic = PUBLIC_ROUTES.some((r) => req.url.includes(r));
  if (!isApi || isPublic) return next(req);

  const withToken = (r: HttpRequest<unknown>, token: string) =>
    r.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const token = auth.getToken();
  const canRefresh = !NO_REFRESH_ROUTES.some((r) => req.url.includes(r));

  return next(token ? withToken(req, token) : req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || !token || !canRefresh) return throwError(() => err);

      return auth.refreshToken().pipe(
        switchMap((newToken) => next(withToken(req, newToken))),
      );
    }),
  );
};
