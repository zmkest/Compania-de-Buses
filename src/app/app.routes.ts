import { Routes } from '@angular/router';
import { authGuard, guestGuard, resetTokenGuard, roleGuard } from './auth/auth.guard';
import { EUserRole } from './shared/enums/user.enum';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard, resetTokenGuard],
  },
  {
    path: '',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'viajes', pathMatch: 'full' },
      { path: 'viajes', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
      {
        path: 'flota',
        canActivate: [roleGuard(EUserRole.ADMIN)],
        children: [
          { path: '', redirectTo: 'buses', pathMatch: 'full' },
          {
            path: 'buses',
            children: [
              { path: '', loadComponent: () => import('./buses/bus-admin/bus-admin.component').then(m => m.BusAdminComponent) },
              { path: 'historial', loadComponent: () => import('./buses/bus-status-history/bus-status-history.component').then(m => m.BusStatusHistoryComponent) },
            ],
          },
        ],
      },
      { path: 'choferes', loadComponent: () => import('./chofer/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'tripulacion', loadComponent: () => import('./tripulacion/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'consultas', loadComponent: () => import('./consultas/consultas.component').then(m => m.ConsultasComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      {
        path: 'usuarios',
        loadComponent: () => import('./users/user-admin/user-admin.component').then(m => m.UserAdminComponent),
        canActivate: [roleGuard(EUserRole.ADMIN)],
      },
    ],
  },
];