import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './features/auth/pages/dashboard/dashboard';

export const routes: Routes = [

  // Login
  {
    path: 'login',
    component: LoginComponent
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
      }

    ]
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'login'
  }

];