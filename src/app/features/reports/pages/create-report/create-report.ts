import { Component } from '@angular/core';

import { ReportWizardComponent } from '../../components/report-wizard/report-wizard';
import { ReportClassicComponent } from '../../components/report-classic/report-classic';
import { APP_CONFIG } from '../../../../app.config';


@Component({

    selector:'app-create-report',

    standalone:true,

    imports:[
        ReportClassicComponent,
        ReportWizardComponent
    ],

    templateUrl:'./create-report.html',
    styleUrl:'./create-report.scss'

})

export class CreateReportComponent{

    useWizard = APP_CONFIG.REPORT_MODE;
    

}