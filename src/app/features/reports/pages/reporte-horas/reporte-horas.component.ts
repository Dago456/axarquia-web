import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { EnvService } from '../../../../core/services/env.service';
import { OperarioService } from '../../services/operario.service';
import { Operario } from '../../models/operario.model';
import { RegistroHorasPdfService } from '../../services/registro-horas-pdf.service';

export interface TareaReporte {
    id_registro: number;
    nombre_tarea: string;
    hora_inicio: string;
    hora_fin: string | null;
    duracion_segundos: number;
}

export interface DiaReporte {
    fecha: string;
    tareas: TareaReporte[];
    total_dia_segundos: number;
}

export interface OperarioReporte {
    id_operario: number;
    nombre_operario: string;
    dias: DiaReporte[];
    total_operario_segundos: number;
}

export interface ReporteHorasRespuesta {
    fecha_inicio: string;
    fecha_fin: string;
    operarios: OperarioReporte[];
}

@Component({
    selector: 'app-reporte-horas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './reporte-horas.component.html',
    styleUrl: './reporte-horas.component.scss'
})
export class ReporteHorasComponent implements OnInit {

    private http = inject(HttpClient);
    private env = inject(EnvService);
    private operarioService = inject(OperarioService);
    private pdfService = inject(RegistroHorasPdfService);

    modo: 'individual' | 'grupal' = 'individual';

    operarios: Operario[] = [];
    idOperarioSeleccionado: number | null = null;

    fechaInicio = '';
    fechaFin = '';

    cargando = false;
    error = '';

    resultado: ReporteHorasRespuesta | null = null;

    ngOnInit(): void {

        this.operarioService
            .listarOperarios()
            .subscribe({
                next: (operarios) => {
                    this.operarios = operarios;
                },
                error: (error) => {
                    console.error('Error cargando operarios:', error);
                }
            });

        const hoy = new Date();

        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        this.fechaInicio = this.formatearFechaInput(inicioMes);

        this.fechaFin = this.formatearFechaInput(hoy);

    }

    cambiarModo(modo: 'individual' | 'grupal'): void {

        this.modo = modo;

        this.resultado = null;

        this.error = '';

    }

    generarReporte(): void {

        this.error = '';

        if (!this.fechaInicio || !this.fechaFin) {

            this.error = 'Selecciona el rango de fechas.';

            return;

        }

        if (this.modo === 'individual' && !this.idOperarioSeleccionado) {

            this.error = 'Selecciona un operario.';

            return;

        }

        this.cargando = true;

        this.resultado = null;

        let url =
            `${this.env.ENDPOINT_PRIMARY}/registro-horas/reporte` +
            `?fecha_inicio=${this.fechaInicio}&fecha_fin=${this.fechaFin}`;

        if (this.modo === 'individual' && this.idOperarioSeleccionado) {

            url += `&id_operario=${this.idOperarioSeleccionado}`;

        }

        this.http
            .get<ReporteHorasRespuesta>(url)
            .subscribe({

                next: (respuesta) => {

                    this.resultado = respuesta;

                    this.cargando = false;

                },

                error: (error) => {

                    console.error(
                        'Error generando el reporte:',
                        error
                    );

                    this.error =
                        'No fue posible generar el reporte.';

                    this.cargando = false;

                }

            });

    }

    formatearDuracion(segundos: number): string {

        const horas = Math.floor(segundos / 3600);

        const minutos = Math.floor((segundos % 3600) / 60);

        if (horas > 0) {

            return `${horas} h ${minutos} min`;

        }

        return `${minutos} min`;

    }

    formatearHora(hora: string | null): string {

        return hora ? hora.slice(0, 5) : '-';

    }

    formatearFecha(fecha: string): string {

        return new Date(`${fecha}T00:00:00`)
            .toLocaleDateString('es-ES', {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
            });

    }

    descargarPdf(): void {

        if (!this.resultado) {
            return;
        }

        this.pdfService.descargarReporte(
            this.resultado,
            this.modo
        );

    }

    private formatearFechaInput(fecha: Date): string {

        const pad = (numero: number) => String(numero).padStart(2, '0');

        return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

    }

}
