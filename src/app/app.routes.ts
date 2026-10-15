import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './auth/auth.guard';
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
          { path: 'buses', loadComponent: () => import('./buses/bus-admin/bus-admin.component').then(m => m.BusAdminComponent) },
        ],
      },
      { path: 'choferes', loadComponent: () => import('./chofer/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'tripulacion', loadComponent: () => import('./tripulacion/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'consultas', loadComponent: () => import('./consultas/consultas.component').then(m => m.ConsultasComponent) },
      {
        path: 'usuarios',
        loadComponent: () => import('./users/user-admin/user-admin.component').then(m => m.UserAdminComponent),
        canActivate: [roleGuard(EUserRole.ADMIN)],
      },
    ],
  },
];