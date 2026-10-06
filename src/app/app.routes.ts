import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent)},
  { path: 'viajes', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
  { path: 'buses', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
  { path: 'choferes', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
  { path: 'tripulacion', loadComponent: () => import('./viaje/principal/principal.component').then(m => m.PrincipalComponent) },
  { path: 'consultas', loadComponent: () => import('./consultas/consultas.component').then(m => m.ConsultasComponent) },
];