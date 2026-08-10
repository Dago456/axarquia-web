import { Injectable } from '@angular/core';
import { Report } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  report: Report = {

    idComunidad:0,
    nombreComunidad:'',
    ubicacionComunidad:'',

    motivoVisita:'',
    conceptoTrabajo:'',
    observaciones:'',
    horaEntrada:'',

    operario: [],
    contacto:'',

    materiales:[],

    conceptoCobro:'',
    valorCobro:null,

    fotos:[],

    firma:null

  };

  getReport(){

    return this.report;

  }

  setReport(report:Report){

    this.report = report;

  }

  limpiar(){

    this.report = {

      idComunidad:0,
      nombreComunidad:'',
      ubicacionComunidad:'',

      motivoVisita:'',
      conceptoTrabajo:'',
      observaciones:'',
      horaEntrada:'',

      operario:[],
      contacto:'',

      materiales:[],

      conceptoCobro:'',
      valorCobro:null,

      fotos:[],

      firma:null

    };

  }

}