import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EUserRole } from '../shared/enums/user.enum';
import { NotificationService } from '../core/notifications/notification.service';
import { AppError } from '../core/errors/app-error';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};

export const roleGuard = (...roles: EUserRole[]): CanActivateFn => () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    if (user && roles.includes(user.role)) {
        return true;
    }

    return router.createUrlTree(['/']);
};

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/']);
};

export const resetTokenGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    const loginUrl = router.createUrlTree(['/login']);
    const token = route.queryParamMap.get('token');

    if (!token) {
        notification.error('Enlace inválido o expirado');
        return loginUrl;
    }

    return authService.verifyResetToken(token).pipe(
        map(valid => valid || loginUrl),
        catchError((err: AppError) => {
            notification.error(err.message);
            return of(loginUrl);
        }),
    );
};
