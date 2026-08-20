import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';

interface AccesoRapido {
    titulo: string;
    descripcion: string;
    icono: string;
    ruta: string;
    color: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class DashboardComponent {

    private authService = inject(AuthService);

    operario = this.authService.obtenerOperario();

    accesos: AccesoRapido[] = [

        {
            titulo: 'Escáner',
            descripcion: 'Escanea el QR de una comunidad y empieza un parte.',
            icono: 'fa-solid fa-qrcode',
            ruta: '/scanner',
            color: 'azul'
        },

        {
            titulo: 'Crear reporte',
            descripcion: 'Registra un parte de trabajo sin comunidad asociada.',
            icono: 'fa-solid fa-file-lines',
            ruta: '/reportwithout',
            color: 'morado'
        },

        {
            titulo: 'Listas QR',
            descripcion: 'Da de alta comunidades y genera sus códigos QR.',
            icono: 'fa-solid fa-list-check',
            ruta: '/listqr',
            color: 'verde'
        },

        {
            titulo: 'Registro de horas',
            descripcion: 'Inicia y finaliza tus tareas del día.',
            icono: 'fa-solid fa-clock',
            ruta: '/registrohoras',
            color: 'naranja'
        },

        {
            titulo: 'Historial',
            descripcion: 'Consulta los partes ya enviados por comunidad.',
            icono: 'fa-solid fa-folder-open',
            ruta: '/historial',
            color: 'rojo'
        },

        {
            titulo: 'Reporte de horas',
            descripcion: 'Cuánto trabajó cada operario, día a día.',
            icono: 'fa-solid fa-chart-column',
            ruta: '/reportehoras',
            color: 'azul'
        },

        {
            titulo: 'Usuarios',
            descripcion: 'Gestiona los operarios del sistema.',
            icono: 'fa-solid fa-users',
            ruta: '/usuarios',
            color: 'morado'
        }

    ];

}
