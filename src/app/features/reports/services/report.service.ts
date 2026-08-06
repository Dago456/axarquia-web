import { Injectable } from '@angular/core';
import { Report } from '../models/report.models';


@Injectable({

    providedIn:'root'

})

export class ReportService{

    report:Report={

        idComunidad:0,

        nombreComunidad:'',

        ubicacionComunidad:'',

        motivoVisita:'',

        conceptoTrabajo:'',

        observaciones:'',

        horaEntrada:'',

        operario:null,

        contacto:'',

        materiales:[],

        conceptoCobro:'',

        valorCobro:null,

        fotos:[],

        firma:null

    };

}