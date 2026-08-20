import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvService } from '../../../core/services/env.service';
import { Report } from '../models/report.models';

@Injectable({
    providedIn: 'root'
})
export class ReportApiService {

    constructor(
        private http: HttpClient,
        private env: EnvService
    ) { }

    crearParte(report: Report): Observable<any> {

        const ahora = new Date();

        const horaAutomatica = ahora.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const fechaActual = ahora.toLocaleDateString('es-ES');

        const añoActual = ahora.getFullYear().toString();

        const datosParte = {
            id_comunidades: report.idComunidad,
            nom_comunidad: report.nombreComunidad,
            ubi_comunidad: report.ubicacionComunidad,
            motivo_visita: report.motivoVisita,
            conceptos_trabajo: report.conceptoTrabajo,
            observaciones: report.observaciones,
            hora_entrada: report.horaEntrada,
            hora_finalizacion: report.horaFinalizacion,
            duracion: report.duracion,
            operario: report.operario.join(', '),
            contacto: report.contacto,
            materiales: report.materiales.join(", "),
            hora_automatica: horaAutomatica,
            fecha_actual: fechaActual,
            año_actual: añoActual
        };

        return this.http.post<any>(
            `${this.env.ENDPOINT_PRIMARY}/partes`,
            datosParte
        );
    }

    guardarPdfParte(idParte: number, pdfBase64: string): Observable<any> {

        return this.http.put<any>(
            `${this.env.ENDPOINT_PRIMARY}/partes/${idParte}/pdf`,
            { pdfBase64 }
        );
    }
}