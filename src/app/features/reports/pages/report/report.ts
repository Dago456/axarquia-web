import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../services/report.service';
import { MaterialesComponent } from '../../components/materiales/materiales';
import { MotivoVisitaComponent } from '../../components/motivo-visita/motivo-visita';
import { OperarioListComponent } from '../../components/operario-list/operario-list';
import { Operario } from '../../models/operario.model';

@Component({
    selector: 'app-report',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule,
        MaterialesComponent,
        MotivoVisitaComponent,
        OperarioListComponent,

    ],

    templateUrl: './report.html',
    styleUrl: './report.scss'
})

export class ReportComponent {

    constructor(
        public reportService: ReportService
    ) { }
   
    actualizarOperarios(operarios: Operario[]): void {

        this.reportService.report.operario =
            operarios.map(
                operario => operario.id_Operario
            );
    
        console.log(
            'Operarios del reporte:',
            this.reportService.report.operario
        );
    }
}