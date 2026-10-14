import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

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
      { path: 'buses', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'choferes', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'tripulacion', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'consultas', loadComponent: () => import('./consultas/consultas.component').then(m => m.ConsultasComponent) },
    ],
  },
];