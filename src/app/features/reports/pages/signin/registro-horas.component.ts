import {
    Component,
    OnDestroy,
    OnInit,
    inject
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';
import {
    RegistroHora,
    RegistroHorasService
} from './registro-horas.service';

@Component({
    selector: 'app-registro-horas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './registro-horas.component.html',
    styleUrl: './registro-horas.component.scss'
})
export class RegistroHorasComponent
    implements OnInit, OnDestroy {


    private registroService =
        inject(RegistroHorasService);

    idOperario = 1;
    nombreTarea = '';
    tareaActiva: RegistroHora | null = null;
    historial: RegistroHora[] = [];
    cargando = false;
    finalizando = false;
    error = '';
    tiempoTranscurrido = 0;
    private intervalo: any = null;

    ngOnInit(): void {
        this.cargarTareaActiva();
        this.cargarHistorial();
    }

    cargarTareaActiva(): void {
        this.registroService
            .obtenerTareaActiva(this.idOperario)
            .subscribe({
                next: (respuesta) => {
                    this.tareaActiva =
                        respuesta.tarea;
                    if (this.tareaActiva) {
                        this.iniciarContador();
                    }
                },
                error: (error) => {
                    console.error(
                        'Error obteniendo tarea activa:',
                        error
                    );
                }
            });
    }

    iniciarTarea(): void {
        this.error = '';
        const nombre =
            this.nombreTarea.trim();
        if (!nombre) {
            this.error =
                'Debes ingresar el nombre de la tarea.';
            return;
        }

        this.cargando = true;
        this.registroService
            .iniciarTarea(
                this.idOperario,
                nombre
            )
            .subscribe({
                next: (respuesta) => {
                    this.tareaActiva =
                        respuesta.tarea;
                    this.nombreTarea = '';
                    this.cargando = false;
                    this.iniciarContador();
                },
                error: (error) => {
                    console.error(
                        'Error iniciando tarea:',
                        error
                    );
                    this.error =
                        error?.error?.message ??
                        'No fue posible iniciar la tarea.';
                    this.cargando = false;
                }
            });
    }


    finalizarTarea(): void {
        if (!this.tareaActiva) {
            return;
        }
        this.finalizando = true;
        this.error = '';

        this.registroService
            .finalizarTarea(
                this.tareaActiva.id_registro
            )
            .subscribe({
                next: (respuesta) => {
                    this.detenerContador();
                    this.tareaActiva =
                        respuesta.tarea;
                    this.finalizando = false;
                    this.cargarHistorial();
                },

                error: (error) => {
                    console.error(
                        'Error finalizando tarea:',
                        error
                    );
                    this.error =
                        error?.error?.message ??
                        'No fue posible finalizar la tarea.';
                    this.finalizando = false;
                }
            });
    }

    iniciarContador(): void {
        this.detenerContador();
        this.actualizarContador();
        this.intervalo =
            setInterval(() => {
                this.actualizarContador();
            }, 1000);
    }

    actualizarContador(): void {
        if (!this.tareaActiva) {
            return;
        }
        const inicio =
            new Date(
                this.tareaActiva.fecha_inicio
            ).getTime();

        const ahora =
            new Date().getTime();

        this.tiempoTranscurrido =
            Math.max(
                0,
                ahora - inicio
            );
    }

    detenerContador(): void {
        if (this.intervalo) {
            clearInterval(
                this.intervalo
            );
            this.intervalo = null;
        }
    }


    cargarHistorial(): void {
        this.registroService
            .obtenerHistorial(this.idOperario)
            .subscribe({
                next: (respuesta) => {

                    this.historial =
                        respuesta.tareas;

                },

                error: (error) => {

                    console.error(
                        'Error cargando historial:',
                        error
                    );

                }

            });

    }


    /* =====================================================
       FORMATO TIEMPO
    ====================================================== */

    formatearTiempo(
        milisegundos: number
    ): string {

        const segundos =
            Math.floor(
                milisegundos / 1000
            );


        const horas =
            Math.floor(
                segundos / 3600
            );


        const minutos =
            Math.floor(
                (segundos % 3600) / 60
            );


        const segundosRestantes =
            segundos % 60;


        return [

            horas
                .toString()
                .padStart(2, '0'),

            minutos
                .toString()
                .padStart(2, '0'),

            segundosRestantes
                .toString()
                .padStart(2, '0')

        ].join(':');

    }


    /* =====================================================
       DURACIÓN FINAL
    ====================================================== */

    formatearDuracion(
        minutos: number | null
    ): string {

        if (
            minutos === null ||
            minutos === undefined
        ) {

            return '-';

        }


        const horas =
            Math.floor(
                minutos / 60
            );


        const minutosRestantes =
            minutos % 60;


        if (horas > 0) {

            return `${horas} h ${minutosRestantes} min`;

        }


        return `${minutosRestantes} min`;

    }


    /* =====================================================
       FECHA
    ====================================================== */

    formatearFecha(
        fecha: string
    ): string {

        return new Date(fecha)
            .toLocaleString(
                'es-CO',
                {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }
            );

    }


    /* =====================================================
       DESTROY
    ====================================================== */

    ngOnDestroy(): void {

        this.detenerContador();

    }

}