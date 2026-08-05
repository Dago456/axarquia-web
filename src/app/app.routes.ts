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

  // Layout principal
  {
    path: '',
    component: MainLayoutComponent,
    children: [

      {
        path: '',
        component: DashboardComponent
      }

    ]

  },
  {
    path: 'scanner',
    loadComponent: () =>
      import('./features/scanner/pages/scanner/scanner')
        .then(c => c.ScannerComponent)
  },
  // Ruta no encontrada
  {
    path: '**',
    redirectTo: ''
  }

];