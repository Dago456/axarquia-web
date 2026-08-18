import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './features/auth/pages/dashboard/dashboard';
import { QrReaderComponent } from './features/scanner/components/qr-reader/qr-reader';

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
        path: 'reportwithout',
        loadComponent: () =>
          import('./features/reports/pages/reportwithout/reportwithout')
            .then(c => c.ReportWithoutComponent)
      },
      {
        path: 'listqr',
        loadComponent: () =>
          import('./features/reports/pages/listasqr/listas-qr.component')
            .then(c => c.ListasQrComponent)
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
        path: 'usuarios',
        loadComponent: () =>
          import('./features/users/pages/users/users')
            .then(c => c.UsersComponent)
      },

    ]
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'login'
  }

];