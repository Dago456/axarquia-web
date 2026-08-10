import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-report',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './report.html',
    styleUrl: './report.scss'
})

export class ReportComponent {

    constructor(
        public reportService: ReportService
    ) { }

}