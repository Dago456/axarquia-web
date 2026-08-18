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
      titulo:'Crear Reporte',
      icono:'fa-solid fa-file-lines',
      ruta:'/reportwithout'
  },

    {
      titulo:'Listas QR',
      icono:'fa-solid fa-list-check',
      ruta:'/listqr'
    },

    {
      titulo:'Registro Horas',
      icono:'fa-solid fa-clock',
      ruta:'/registrohoras'
    },

    {
      titulo:'Historial',
      icono:'fa-solid fa-folder-open',
      ruta:'/historial'
    },

    {
      titulo: 'Usuarios',
      ruta: '/usuarios',
      icono: 'fa-solid fa-users'
    }

  ];

  cerrarSesion(): void {

    // Más adelante aquí eliminaremos el token
  
    this.router.navigate(['/login']);
  
  }
}