import { Routes } from '@angular/router';
import { authGuard, guestGuard, resetTokenGuard, roleGuard } from './core/auth/auth.guard';
import { EUserRole } from './core/auth/user.enum';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/identity/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/identity/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/identity/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/identity/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard, resetTokenGuard],
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'viajes', pathMatch: 'full' },
      { path: 'viajes', loadComponent: () => import('./features/legacy/viajes/principal/principal.component').then(m => m.PrincipalComponent) },
      {
        path: 'flota',
        canActivate: [roleGuard(EUserRole.ADMIN)],
        children: [
          { path: '', redirectTo: 'buses', pathMatch: 'full' },
          {
            path: 'buses',
            children: [
              { path: '', loadComponent: () => import('./features/fleet/buses/bus-admin/bus-admin.component').then(m => m.BusAdminComponent) },
              { path: 'historial', loadComponent: () => import('./features/fleet/buses/bus-status-history/bus-status-history.component').then(m => m.BusStatusHistoryComponent) },
              { path: 'disponibles', loadComponent: () => import('./features/fleet/buses/bus-availability/bus-availability.component').then(m => m.BusAvailabilityComponent) },
            ],
          },
          { path: 'asientos', loadComponent: () => import('./features/fleet/seats/seat-admin/seat-admin.component').then(m => m.SeatAdminComponent) },
          {
            path: 'mantenimientos',
            children: [
              { path: '', loadComponent: () => import('./features/fleet/maintenances/maintenance-admin/maintenance-admin.component').then(m => m.MaintenanceAdminComponent) },
              { path: 'costos', loadComponent: () => import('./features/fleet/maintenances/maintenance-cost-report/maintenance-cost-report.component').then(m => m.MaintenanceCostReportComponent) },
            ],
          },
        ],
      },
      {
        path: 'red',
        canActivate: [roleGuard(EUserRole.ADMIN, EUserRole.OPERATOR)],
        children: [
          { path: '', redirectTo: 'terminales', pathMatch: 'full' },
          { path: 'terminales', loadComponent: () => import('./features/network/terminals/terminal-admin/terminal-admin.component').then(m => m.TerminalAdminComponent) },
          { path: 'rutas', loadComponent: () => import('./features/network/routes/route-admin/route-admin.component').then(m => m.RouteAdminComponent) },
        ],
      },
      { path: 'choferes', loadComponent: () => import('./features/legacy/choferes/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'tripulacion', loadComponent: () => import('./features/legacy/tripulacion/principal/principal.component').then(m => m.PrincipalComponent) },
      { path: 'consultas', loadComponent: () => import('./features/legacy/consultas/consultas.component').then(m => m.ConsultasComponent) },
      { path: 'profile', loadComponent: () => import('./features/identity/profile/profile.component').then(m => m.ProfileComponent) },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/identity/users/user-admin/user-admin.component').then(m => m.UserAdminComponent),
        canActivate: [roleGuard(EUserRole.ADMIN)],
      },
    ],
  },
];