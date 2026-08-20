import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.models';

import { MaterialesComponent } from '../../components/materiales/materiales';
import { MotivoVisitaComponent } from '../../components/motivo-visita/motivo-visita';
import { OperarioListComponent } from '../../components/operario-list/operario-list';
import { Operario } from '../../models/operario.model';
import { FotosComponent } from '../../components/fotos/fotos';
import { FirmaComponent } from '../../components/firma/firma';
import { Router } from '@angular/router';
import { ReportPdfService } from '../../services/report-pdf.service';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { ReportEmailService } from '../../services/report-email.service';
import { ReportApiService } from '../../services/report-api.service';
import { EmailService } from '../../../../core/services/reporteservice/email.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-report',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule,
        MaterialesComponent,
        MotivoVisitaComponent,
        OperarioListComponent,
        FotosComponent,
        FirmaComponent,
        ModalComponent,
    ],

    templateUrl: './report.html',
    styleUrl: './report.scss'
})

export class ReportComponent implements OnInit {
    private guardadoTimeout: ReturnType<typeof setTimeout> | null = null;
    mostrarModalEnvio = false;
    mostrarModalFirmaOperario = false;
    estadoEnvio:
        'inactivo' |
        'enviando' |
        'sin-conexion' |
        'exitoso' |
        'error' = 'inactivo';

    mensajeEnvio = '';
    mostrarModalFirmaCliente = false;
    operariosSeleccionados: Operario[] = [];

    constructor(
        public reportService: ReportService,
        private router: Router,
        private reportPdfService: ReportPdfService,
        private reportEmailService: ReportEmailService,
        private reportApiService: ReportApiService,
        private EmailService: EmailService

    ) { }

    cerrarModalEnvio(): void {
        this.mostrarModalEnvio = false;
    }

    continuarDespuesDelEnvio(): void {
        this.mostrarModalEnvio = false;

        this.router.navigate(['/scanner']);
    }

    abrirFirmaOperario(): void {

        this.mostrarModalFirmaOperario = true;

    }

    abrirFirmaCliente(): void {

        this.mostrarModalFirmaCliente = true;

    }


    cerrarFirmaCliente(): void {

        this.mostrarModalFirmaCliente = false;

        this.guardarBorrador();

    }

    async cerrarFirmaOperario(): Promise<void> {

        // Guardamos inmediatamente antes de cerrar.
        // Así no dependemos del timeout de guardarBorrador().
        try {

            await this.reportService.guardarBorrador();

            console.log(
                '✓ Firma del operario guardada correctamente'
            );

        } catch (error) {

            console.error(
                '❌ Error guardando firma del operario:',
                error
            );

        }

        this.mostrarModalFirmaOperario = false;
    }

    calcularDuracion(): void {

        const horaEntrada =
            this.reportService.report.horaEntrada;

        const horaFinalizacion =
            this.reportService.report.horaFinalizacion;


        // ---------------------------------------------------------
        // Si falta alguna de las dos horas
        // ---------------------------------------------------------

        if (!horaEntrada || !horaFinalizacion) {

            this.reportService.report.duracion = '';

            this.guardarBorrador();

            return;
        }


        // ---------------------------------------------------------
        // Convertir HH:mm a minutos
        // ---------------------------------------------------------

        const [horaEntradaNumero, minutoEntrada] =
            horaEntrada.split(':').map(Number);

        const [horaFinalNumero, minutoFinal] =
            horaFinalizacion.split(':').map(Number);


        const minutosEntrada =
            horaEntradaNumero * 60 +
            minutoEntrada;


        const minutosFinalizacion =
            horaFinalNumero * 60 +
            minutoFinal;


        // ---------------------------------------------------------
        // Calcular diferencia
        // ---------------------------------------------------------

        let diferencia =
            minutosFinalizacion -
            minutosEntrada;


        /*
         * Si la hora de finalización es menor que la entrada,
         * asumimos que el trabajo terminó después de medianoche.
         *
         * Ejemplo:
         *
         * Entrada:       22:00
         * Finalización:  01:30
         *
         * Resultado:
         * 3 h 30 min
         */

        if (diferencia < 0) {

            diferencia += 24 * 60;

        }


        // ---------------------------------------------------------
        // Convertir a horas y minutos
        // ---------------------------------------------------------

        const horas =
            Math.floor(diferencia / 60);

        const minutos =
            diferencia % 60;


        // ---------------------------------------------------------
        // Construir texto
        // ---------------------------------------------------------

        let duracion = '';


        if (horas > 0) {

            duracion +=
                `${horas} h`;

        }


        if (minutos > 0) {

            if (duracion) {

                duracion += ' ';

            }

            duracion +=
                `${minutos} min`;

        }


        /*
         * Por seguridad, si las dos horas son iguales,
         * mostramos 0 min.
         */

        if (!duracion) {

            duracion = '0 min';

        }


        // ---------------------------------------------------------
        // Guardar duración calculada
        // ---------------------------------------------------------

        this.reportService.report.duracion =
            duracion;


        console.log(
            '⏱️ Duración calculada:',
            duracion
        );


        // ---------------------------------------------------------
        // Guardar automáticamente el borrador
        // ---------------------------------------------------------

        this.guardarBorrador();

    }

    async ngOnInit(): Promise<void> {

        const report = this.reportService.report;

        if (!report.idComunidad) {

            console.warn(
                'No existe una comunidad seleccionada. Regresando al scanner.'
            );

            await this.router.navigate(['/scanner']);

            return;
        }

        console.log(
            'Parte asociado a comunidad:',
            report.idComunidad
        );
    }

    actualizarOperarios(
        operarios: Operario[]
    ): void {
        this.reportService.report.operario =
            operarios.map(
                operario => operario.nom_ope
            );
        console.log(
            'Operarios del reporte:',
            this.reportService.report.operario
        );
        this.guardarBorrador();
    }

    guardarBorrador(): void {
        if (this.guardadoTimeout) {
            clearTimeout(
                this.guardadoTimeout
            );
        }

        this.guardadoTimeout = setTimeout(
            async () => {
                try {
                    await this.reportService.guardarBorrador();
                    console.log(
                        '✓ Borrador guardado localmente'
                    );
                } catch (error) {
                    console.error(
                        'Error guardando borrador local:',
                        error
                    );
                }
            },
            500
        );
    }

    generarPdf(): void {
        const report =
            this.reportService.report;
        this.reportPdfService.descargarPdf(
            report
        );

    }

    volverDashboard(): void {

        this.router.navigate([
            '/dashboard'
        ]);

    }

    async enviarParte(): Promise<void> {

        const report = this.reportService.report;

        console.log('📤 Iniciando envío del parte...');

        // -----------------------------------------
        // 1. Verificar comunidad
        // -----------------------------------------

        if (!report.idComunidad) {

            console.warn('❌ No existe una comunidad asociada al parte.');

            await this.router.navigate(['/scanner']);

            return;
        }


        // -----------------------------------------
        // 2. Mostrar modal de envío
        // -----------------------------------------

        this.estadoEnvio = 'enviando';

        this.mensajeEnvio =
            'Estamos preparando el PDF y enviando el parte.';

        this.mostrarModalEnvio = true;


        // -----------------------------------------
        // 3. Verificar conexión
        // -----------------------------------------

        if (!navigator.onLine) {

            console.warn('📴 Sin conexión a internet.');

            try {

                await this.reportService.marcarPendienteEnvio();

                console.log(
                    '📦 Parte guardado como pendiente de envío.'
                );

                this.estadoEnvio = 'sin-conexion';

                this.mensajeEnvio =
                    'El parte ha sido guardado en el dispositivo. Regrese cuando tenga conexión para enviarlo.';

            } catch (error) {

                console.error(
                    '❌ Error guardando parte pendiente:',
                    error
                );

                this.estadoEnvio = 'error';

                this.mensajeEnvio =
                    'No fue posible guardar el parte en el dispositivo.';

            }

            return;
        }


        // -----------------------------------------
        // 4. Tenemos conexión
        // -----------------------------------------

        try {

            console.log('🌐 Conexión disponible.');


            // Guardamos primero el parte localmente
            // por seguridad

            await this.reportService.marcarPendienteEnvio();

            console.log(
                '📦 Parte marcado como PENDIENTE_ENVIO.'
            );


            // -----------------------------------------
            // 5. Crear el parte en el backend
            //    (para obtener el id_parte real antes
            //    de generar el PDF)
            // -----------------------------------------

            this.mensajeEnvio =
                'Registrando el parte...';

            console.log('🗂️ Creando el parte...');

            const respuestaParte =
                await firstValueFrom(
                    this.reportApiService.crearParte(report)
                );

            const idParte: number | null =
                respuestaParte?.id_parte ?? null;

            console.log(
                '✅ Parte creado con id:',
                idParte
            );


            // -----------------------------------------
            // 6. Generar PDF
            // -----------------------------------------

            this.mensajeEnvio =
                'Generando el PDF del parte...';

            console.log('📄 Generando PDF...');

            const pdf =
                await this.reportPdfService.generarPdf(report, idParte);

            console.log(
                '✅ PDF generado correctamente.'
            );


            // -----------------------------------------
            // 7. Guardar el PDF en el servidor
            // -----------------------------------------

            if (idParte) {

                this.mensajeEnvio =
                    'Guardando el PDF del parte...';

                const pdfBase64 =
                    await this.blobToBase64(pdf);

                await firstValueFrom(
                    this.reportApiService.guardarPdfParte(
                        idParte,
                        pdfBase64
                    )
                );

                console.log(
                    '✅ PDF guardado en el servidor.'
                );

            }


            // -----------------------------------------
            // 8. Preparar / enviar correo
            // -----------------------------------------

            this.mensajeEnvio =
                'Enviando el parte por correo electrónico...';

            console.log(
                '📧 Preparando envío de correo...'
            );

            await this.reportEmailService.prepararEnvio(
                report,
                pdf
            );

            console.log(
                '✅ Proceso de correo completado correctamente.'
            );


            // -----------------------------------------
            // 9. ÉXITO
            // -----------------------------------------

            await this.reportService.eliminarBorrador();

            this.estadoEnvio = 'exitoso';

            this.mensajeEnvio =
                'El parte fue enviado correctamente.';


        } catch (error) {

            console.error(
                '❌ Error durante el proceso de envío:',
                error
            );


            // -----------------------------------------
            // 10. ERROR
            // -----------------------------------------

            this.estadoEnvio = 'error';

            this.mensajeEnvio =
                'No fue posible enviar el parte. El parte permanece guardado en el dispositivo para evitar perder la información.';

        }

    }

    private blobToBase64(blob: Blob): Promise<string> {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onloadend = () => {

                const resultado = reader.result as string;

                resolve(resultado.split(',')[1]);
            };

            reader.onerror = () => {

                reject(
                    new Error('No fue posible convertir el PDF a Base64.')
                );
            };

            reader.readAsDataURL(blob);
        });
    }

}