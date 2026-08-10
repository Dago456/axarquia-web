import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MenuItem } from '../../interfaces/menu-item';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  
  sidebar = inject(SidebarService); 

  constructor(private router: Router) {} 

  menu:MenuItem[]=[

    {
      titulo: 'Inicio',
      icono: 'fa-solid fa-house',
      ruta: '/dashboard'
    },

    {
      titulo:'Escáner',
      icono:'fa-solid fa-qrcode',
      ruta:'/scanner'
    },

    {
      titulo:'Cobros',
      icono:'fa-solid fa-money-bill-wave',
      ruta:'/cobros'
    },

    {
      titulo:'Listas QR',
      icono:'fa-solid fa-list-check',
      ruta:'/listas-qr'
    },

    {
      titulo:'Registro Horas',
      icono:'fa-solid fa-clock',
      ruta:'/registro-horas'
    },

    {
      titulo:'Crear Reporte',
      icono:'fa-solid fa-file-lines',
      ruta:'/reportes'
    },

    {
      titulo:'Historial',
      icono:'fa-solid fa-folder-open',
      ruta:'/historial'
    },

    {
      titulo:'Usuarios',
      icono:'fa-solid fa-users',
      ruta:'/usuarios'
    }

  ];

  cerrarSesion(): void {

    // Más adelante aquí eliminaremos el token
  
    this.router.navigate(['/login']);
  
  }
}