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
import { EmailService } from '../../../../core/services/reporteservice/email.service';

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

    estadoEnvio:
        'inactivo' |
        'enviando' |
        'sin-conexion' |
        'exitoso' |
        'error' = 'inactivo';

    mensajeEnvio = '';

    constructor(
        public reportService: ReportService,
        private router: Router,
        private reportPdfService: ReportPdfService,
        private reportEmailService: ReportEmailService,
        private EmailService: EmailService

    ) { }

    cerrarModalEnvio(): void {
        this.mostrarModalEnvio = false;
    }

    continuarDespuesDelEnvio(): void {
        this.mostrarModalEnvio = false;

        this.router.navigate(['/scanner']);
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

    async enviarParte(): Promise<void> {

        const report = this.reportService.report;
    
        console.log('📤 Iniciando envío del parte...');
    
        // ------------------------------------------------
        // 1. Verificar comunidad
        // ------------------------------------------------
    
        if (!report.idComunidad) {
    
            console.warn(
                '❌ No existe una comunidad asociada al parte.'
            );
    
            await this.router.navigate(['/scanner']);
    
            return;
        }
    
        // ------------------------------------------------
        // 2. Verificar conexión
        // ------------------------------------------------
    
        if (!navigator.onLine) {
    
            console.warn(
                '📴 Sin conexión a internet.'
            );
    
            try {
    
                await this.reportService.marcarPendienteEnvio();
    
                console.log(
                    '📦 Parte guardado como pendiente de envío.'
                );
    
                this.estadoEnvio = 'sin-conexion';
    
                this.mensajeEnvio =
                    'El parte ha sido guardado en el dispositivo. Se enviará automáticamente cuando vuelva la conexión.';
    
                this.mostrarModalEnvio = true;
    
            } catch (error) {
    
                console.error(
                    '❌ Error guardando parte pendiente:',
                    error
                );
    
                this.estadoEnvio = 'error';
    
                this.mensajeEnvio =
                    'No fue posible guardar el parte en el dispositivo.';
    
                this.mostrarModalEnvio = true;
            }
    
            return;
        }
    
        // ------------------------------------------------
        // 3. Tenemos conexión
        // ------------------------------------------------
    
        try {

            console.log(
                '🌐 Conexión disponible.'
            );
        
            await this.reportService.marcarPendienteEnvio();
        
            console.log(
                '📦 Parte marcado como PENDIENTE_ENVIO.'
            );
        
            // Generar PDF
            console.log(
                '📄 Generando PDF...'
            );
        
            const pdf =
                await this.reportPdfService.generarPdf(
                    report
                );
        
            console.log(
                '✅ PDF generado correctamente.'
            );
        
            // Enviar correo
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
        
        } catch (error) {
        
            console.error(
                '❌ Error durante el proceso de envío:',
                error
            );
        
        }
    }

}