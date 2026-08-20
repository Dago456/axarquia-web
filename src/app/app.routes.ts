import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './features/auth/pages/dashboard/dashboard';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';

export const routes: Routes = [

  // Login
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },

  // Al ingresar a la aplicación
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Layout principal
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'scanner',
        loadComponent: () =>
          import('./features/scanner/pages/scanner/scanner')
            .then(c => c.ScannerComponent)
      },
      
      {
        path: 'report',
        loadComponent: () =>
          import('./features/reports/pages/report/report')
            .then(c => c.ReportComponent)
      },

      {
        path: 'report/:id',
        loadComponent: () =>
          import('./features/reports/pages/create-report/create-report')
            .then(c => c.CreateReportComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/users/pages/users/users')
            .then(c => c.UsersComponent)
      },
      {
        path: 'listqr',
        loadComponent: () =>
          import('./features/reports/pages/listasqr/listas-qr.component')
            .then(c => c.ListasQrComponent)
      },
      {
        path: 'reportwithout',
        loadComponent: () =>
          import('./features/reports/pages/reportwithout/reportwithout')
            .then(c => c.ReportWithoutComponent)
      },
      {
        path: 'registrohoras',
        loadComponent: () =>
          import('./features/reports/pages/signin/registro-horas.component')
            .then(c => c.RegistroHorasComponent)
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/reports/pages/historial-partes/historial-partes.component')
            .then(c => c.HistorialPartesComponent)
      },
      {
        path: 'reportehoras',
        loadComponent: () =>
          import('./features/reports/pages/reporte-horas/reporte-horas.component')
            .then(c => c.ReporteHorasComponent)
      },

    ]
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'login'
  }

];