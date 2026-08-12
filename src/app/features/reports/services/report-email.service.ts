import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { Report } from '../models/report.models';
import { EnvService } from '../../../core/services/env.service';

@Injectable({
    providedIn: 'root'
})
export class ReportEmailService {

    private http = inject(HttpClient);
    private env = inject(EnvService);

    async prepararEnvio(
        report: Report,
        pdf: Blob,
        destinatarioAdicional?: string
    ): Promise<void> {

        console.log('📧 Preparando envío de correo...');

        console.log(
            '📨 Destinatario principal: AXARQUIA'
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
         * ==========================================
         * PDF → BASE64
         * ==========================================
         */

        const pdfBase64 =
            await this.blobToBase64(pdf);

        console.log(
            '📄 PDF convertido a Base64:',
            pdfBase64.length,
            'caracteres'
        );

        /*
         * ==========================================
         * DATOS PARA EL BACKEND
         * ==========================================
         */

        const datos = {

            report,

            pdfBase64,

            destinatarioAdicional:
                destinatarioAdicional?.trim() || undefined

        };

        console.log(
            '📤 Enviando información al backend...'
        );

        /*
         * ==========================================
         * ENVÍO REAL
         * ==========================================
         */

        const respuesta =
            await firstValueFrom(

                this.http.post<{
                    success: boolean;
                    message: string;
                    messageId?: string;
                }>(

                    `${this.env.ENDPOINT_PRIMARY}/correo/enviar-parte`,

                    datos

                )

            );

        console.log(
            '📨 Respuesta del servidor:',
            respuesta
        );

        if (!respuesta.success) {

            throw new Error(
                respuesta.message ||
                'El servidor no pudo enviar el correo.'
            );

        }

        console.log(
            '✅ Correo enviado correctamente.'
        );

    }

    /*
     * ==========================================
     * BLOB → BASE64
     * ==========================================
     */

    private blobToBase64(
        blob: Blob
    ): Promise<string> {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onloadend = () => {

                    const resultado =
                        reader.result as string;

                    /*
                     * FileReader devuelve:
                     *
                     * data:application/pdf;base64,XXXXXX
                     *
                     * Nosotros solamente necesitamos:
                     *
                     * XXXXXX
                     */

                    const base64 =
                        resultado.split(',')[1];

                    resolve(base64);

                };

                reader.onerror = () => {

                    reject(
                        new Error(
                            'No fue posible convertir el PDF a Base64.'
                        )
                    );

                };

                reader.readAsDataURL(blob);

            }
        );

    }

}