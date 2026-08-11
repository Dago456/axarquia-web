import { Injectable } from '@angular/core';

import { Report } from '../models/report.models';

@Injectable({
    providedIn: 'root'
})
export class ReportEmailService {

    /*
     * Correo interno de Axarquia.
     *
     * Por ahora es una constante temporal.
     * Más adelante podremos obtenerlo desde configuración
     * o desde el backend.
     */
    private readonly CORREO_AXARQUIA =
        'correo@axarquia.com';

    async prepararEnvio(
        report: Report,
        pdf: Blob,
        destinatarioAdicional?: string
    ): Promise<void> {

        console.log(
            '📧 Preparando envío de correo...'
        );

        console.log(
            '📨 Destinatario principal:',
            this.CORREO_AXARQUIA
        );

        if (destinatarioAdicional) {

            console.log(
                '📨 Destinatario adicional:',
                destinatarioAdicional
            );

        }

        console.log(
            '📄 PDF recibido:',
            pdf.size,
            'bytes'
        );

        console.log(
            '🏢 Comunidad:',
            report.nombreComunidad
        );

        /*
         * IMPORTANTE:
         *
         * Aquí todavía NO enviamos el correo.
         *
         * En el futuro esta información se enviará
         * al backend mediante HttpClient.
         */

        await new Promise(
            resolve => setTimeout(resolve, 1000)
        );

        console.log(
            '📧 Simulación de envío completada.'
        );
    }
}