import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { MaterialesComponent } from '../../components/materiales/materiales';
import { MotivoVisitaComponent } from '../../components/motivo-visita/motivo-visita';
import { OperarioListComponent } from '../../components/operario-list/operario-list';
import { FotosComponent } from '../../components/fotos/fotos';
import { FirmaComponent } from '../../components/firma/firma';

import { ReportService } from '../../services/report.service';
import { ReportPdfService } from '../../services/report-pdf.service';
import { ReportEmailService } from '../../services/report-email.service';
import { ReportApiService } from '../../services/report-api.service';

import { ModalComponent } from '../../../../shared/components/modal/modal';
import { Operario } from '../../models/operario.model';
import { firstValueFrom } from 'rxjs';
import { IndexedDbService, ReportDraft } from '../../../../services/indexed-db.service';

@Component({
    selector: 'app-report-without',

    standalone: true,

    imports: [
        CommonModule,
        FormsModule,

        MaterialesComponent,
        MotivoVisitaComponent,
        OperarioListComponent,
        FotosComponent,
        FirmaComponent,
        ModalComponent
    ],

    templateUrl: './reportwithout.html',
    styleUrl: './reportwithout.scss'
})
export class ReportWithoutComponent implements OnInit {

    mostrarModalFirmaOperario = false;
    mostrarModalFirmaCliente = false;
    private guardadoTimeout: ReturnType<typeof setTimeout> | null = null;
    operariosSeleccionados: Operario[] = [];

    parteEnProceso?: ReportDraft;
    mostrarModalParte = false;

    constructor(
        public reportService: ReportService,
        private router: Router,
        private reportPdfService: ReportPdfService,
        private reportEmailService: ReportEmailService,
        private reportApiService: ReportApiService,
        private indexedDbService: IndexedDbService
    ) {}


    // =========================================================
    // INICIALIZAR
    // =========================================================

    async ngOnInit(): Promise<void> {

        const partes =
            await this.reportService.obtenerPartesSinComunidad();

        if (partes.length > 0) {

            partes.sort(
                (a, b) =>
                    new Date(b.actualizadoEn).getTime() -
                    new Date(a.actualizadoEn).getTime()
            );

            this.parteEnProceso = partes[0];

            this.mostrarModalParte = true;

            console.log(
                '📄 Reporte sin comunidad en proceso:',
                this.parteEnProceso
            );

            return;
        }

        this.reportService.nuevoParteSinComunidad();

        console.log(
            '📝 Nuevo reporte sin comunidad iniciado'
        );
    }


    // =========================================================
    // PARTE EN PROCESO (sin comunidad)
    // =========================================================

    async continuarParte(): Promise<void> {

        if (!this.parteEnProceso) {
            return;
        }

        const cargado =
            await this.reportService.cargarBorrador(
                this.parteEnProceso.id
            );

        if (!cargado) {

            console.error(
                'No se pudo cargar el reporte sin comunidad'
            );

            this.reportService.nuevoParteSinComunidad();

        }

        this.mostrarModalParte = false;

    }

    async descartarParte(): Promise<void> {

        if (!this.parteEnProceso) {
            return;
        }

        try {

            await this.indexedDbService.eliminarParte(
                this.parteEnProceso.id
            );

            console.log(
                '🗑️ Reporte sin comunidad descartado'
            );

        } catch (error) {

            console.error(
                'Error descartando el reporte sin comunidad:',
                error
            );

        }

        this.parteEnProceso = undefined;

        this.mostrarModalParte = false;

        this.reportService.nuevoParteSinComunidad();

    }

    cerrarModalParte(): void {

        this.mostrarModalParte = false;

    }

    // =========================================================
    // NAVEGACIÓN
    // =========================================================

    volverDashboard(): void {

        this.router.navigate([
            '/dashboard'
        ]);

    }

    abrirFirmaCliente(): void {

        this.mostrarModalFirmaCliente = true;
      
      }
      
      
      cerrarFirmaCliente(): void {
      
        this.mostrarModalFirmaCliente = false;
      
        this.guardarBorrador();
      
      }

    // =========================================================
    // FIRMA DEL OPERARIO
    // =========================================================

    abrirFirmaOperario(): void {

        this.mostrarModalFirmaOperario = true;

    }


    async cerrarFirmaOperario(): Promise<void> {

        try {

            await this.reportService.guardarBorrador();

            console.log(
                '✓ Firma del operario guardada'
            );

        } catch (error) {

            console.error(
                '❌ Error guardando firma:',
                error
            );

        }

        this.mostrarModalFirmaOperario = false;

    }


    // =========================================================
    // GUARDAR BORRADOR
    // =========================================================

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
                        '✓ Reporte sin comunidad guardado'
                    );

                } catch (error) {

                    console.error(
                        '❌ Error guardando reporte:',
                        error
                    );

                }

            },
            500
        );

    }


    async guardarAhora(): Promise<void> {

        try {

            await this.reportService.guardarBorrador();

            console.log(
                '✓ Reporte sin comunidad guardado'
            );

        } catch (error) {

            console.error(
                '❌ Error guardando reporte:',
                error
            );

        }

    }


    // =========================================================
    // OPERARIOS
    // =========================================================

    actualizarOperarios(operarios: Operario[]): void {

        this.operariosSeleccionados = operarios;
    
        this.reportService.report.operario =
            operarios.map(
                operario => operario.nom_ope
            );
    
        this.guardarBorrador();
    }


    // =========================================================
    // DURACIÓN
    // =========================================================

    calcularDuracion(): void {

        const horaEntrada =
            this.reportService.report.horaEntrada;

        const horaFinalizacion =
            this.reportService.report.horaFinalizacion;


        if (
            !horaEntrada ||
            !horaFinalizacion
        ) {

            this.reportService.report.duracion = '';

            this.guardarBorrador();

            return;

        }


        const [
            horaEntradaNumero,
            minutoEntrada
        ] =
            horaEntrada
                .split(':')
                .map(Number);


        const [
            horaFinalNumero,
            minutoFinal
        ] =
            horaFinalizacion
                .split(':')
                .map(Number);


        const minutosEntrada =
            horaEntradaNumero * 60 +
            minutoEntrada;


        const minutosFinalizacion =
            horaFinalNumero * 60 +
            minutoFinal;


        let diferencia =
            minutosFinalizacion -
            minutosEntrada;


        if (diferencia < 0) {

            diferencia += 24 * 60;

        }


        const horas =
            Math.floor(
                diferencia / 60
            );


        const minutos =
            diferencia % 60;


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


        if (!duracion) {

            duracion = '0 min';

        }


        this.reportService.report.duracion =
            duracion;


        this.guardarBorrador();

    }


    // =========================================================
    // GENERAR PDF
    // =========================================================

    generarPdf(): void {

        const report =
            this.reportService.report;

        this.reportPdfService.descargarPdf(
            report
        );

    }


    // =========================================================
    // ENVIAR PARTE
    // =========================================================

    async enviarParte(): Promise<void> {

        const report = this.reportService.report;
    
    
        // =====================================================
        // VALIDAR NOMBRE DE COMUNIDAD
        // =====================================================
    
        if (!report.nombreComunidad?.trim()) {
    
            alert(
                'Ingrese el nombre de la comunidad.'
            );
    
            return;
        }
    
    
        // =====================================================
        // VALIDAR UBICACIÓN
        // =====================================================
    
        if (!report.ubicacionComunidad?.trim()) {
    
            alert(
                'Ingrese la dirección o ubicación de la comunidad.'
            );
    
            return;
        }
    
    
        try {
    
            console.log(
                '📤 Enviando reporte sin comunidad...'
            );
    
    
            await this.reportService.marcarPendienteEnvio();


            const respuestaParte =
                await firstValueFrom(
                    this.reportApiService.crearParte(report)
                );

            const idParte: number | null =
                respuestaParte?.id_parte ?? null;


            const pdf =
                await this.reportPdfService.generarPdf(
                    report,
                    idParte
                );


            if (idParte) {

                const pdfBase64 =
                    await this.blobToBase64(pdf);

                await firstValueFrom(
                    this.reportApiService.guardarPdfParte(
                        idParte,
                        pdfBase64
                    )
                );
            }


            await this.reportEmailService.prepararEnvio(
                report,
                pdf
            );


            await this.reportService.eliminarBorrador();
    
    
            console.log(
                '✅ Reporte enviado correctamente'
            );
    
    
            alert(
                'El reporte fue enviado correctamente.'
            );
    
    
            this.router.navigate([
                '/dashboard'
            ]);
    
        } catch (error) {
    
            console.error(
                '❌ Error enviando reporte:',
                error
            );
    
    
            alert(
                'No fue posible enviar el reporte. El reporte permanece guardado en el dispositivo.'
            );

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