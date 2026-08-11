import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../services/report.service';
import { MaterialesComponent } from '../../components/materiales/materiales';
import { MotivoVisitaComponent } from '../../components/motivo-visita/motivo-visita';
import { OperarioListComponent } from '../../components/operario-list/operario-list';
import { Operario } from '../../models/operario.model';
import { FotosComponent } from '../../components/fotos/fotos';
import { FirmaComponent } from '../../components/firma/firma';
import { ReportApiService } from '../../services/report-api.service';
import { Router } from '@angular/router';

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
    ],

    templateUrl: './report.html',
    styleUrl: './report.scss'
})

export class ReportComponent implements OnInit {
    private guardadoTimeout: ReturnType<typeof setTimeout> | null = null;
    constructor(
        public reportService: ReportService,
        private reportApiService: ReportApiService,
        private router: Router,
    ) { }

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

    enviarParte(): void {
        const report =
            this.reportService.report;
        console.log(
            'Enviando parte:',
            report
        );

        this.reportApiService
            .crearParte(report)
            .subscribe({
                next: (respuesta) => {
                    console.log(
                        'Parte creado correctamente:',
                        respuesta
                    );
                },

                error: (error) => {
                    console.error(
                        'Error creando el parte:',
                        error
                    );
                }
            });
    }
}