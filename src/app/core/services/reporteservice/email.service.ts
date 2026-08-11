import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Report } from '../../../features/reports/models/report.models';
import { EnvService } from '../env.service';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    private http = inject(HttpClient);
    private env = inject(EnvService);

    enviarParte(
        report: Report,
        pdf: Blob,
        destinatarioAdicional?: string
    ) {

        return this.blobToBase64(pdf).then(
            pdfBase64 => {

                const body = {

                    report,

                    pdfBase64,

                    destinatarioAdicional:
                        destinatarioAdicional || null

                };

                console.log(
                    '📧 Enviando parte al backend...'
                );

                return this.http.post(
                    `${this.env.ENDPOINT_PRIMARY}/correo/enviar-parte`,
                    body
                ).toPromise();

            }
        );
    }

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

                    const base64 =
                        resultado.split(',')[1];

                    resolve(base64);
                };

                reader.onerror =
                    reject;

                reader.readAsDataURL(blob);
            }
        );
    }
}