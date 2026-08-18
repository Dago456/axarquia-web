import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../../../../core/services/env.service';
import { Observable } from 'rxjs';

export interface RegistroHora {
    id_registro: number;
    id_operario: number;
    nombre_tarea: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    duracion_minutos: number | null;
    estado: 'ACTIVA' | 'FINALIZADA';
}

@Injectable({
    providedIn: 'root'
})
export class RegistroHorasService {

    private http = inject(HttpClient);
    private env = inject(EnvService);

    private endpoint =
        `${this.env.ENDPOINT_PRIMARY}/registro-horas`;


    iniciarTarea(
        id_operario: number,
        nombre_tarea: string
    ): Observable<{ message: string; tarea: RegistroHora }> {

        return this.http.post<{
            message: string;
            tarea: RegistroHora;
        }>(
            `${this.endpoint}/iniciar`,
            {
                id_operario,
                nombre_tarea
            }
        );

    }


    finalizarTarea(
        id_registro: number
    ): Observable<{ message: string; tarea: RegistroHora }> {

        return this.http.put<{
            message: string;
            tarea: RegistroHora;
        }>(
            `${this.endpoint}/finalizar/${id_registro}`,
            {}
        );

    }


    obtenerTareaActiva(
        id_operario: number
    ): Observable<{ tarea: RegistroHora | null }> {

        return this.http.get<{
            tarea: RegistroHora | null;
        }>(
            `${this.endpoint}/activa/${id_operario}`
        );

    }


    obtenerHistorial(
        id_operario: number
    ): Observable<{ tareas: RegistroHora[] }> {

        return this.http.get<{
            tareas: RegistroHora[];
        }>(
            `${this.endpoint}/operario/${id_operario}`
        );

    }

}