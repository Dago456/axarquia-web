import { Injectable } from '@angular/core';

import { Report } from '../models/report.models';
import { IndexedDbService } from '../../../services/indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  report: Report = {

    idComunidad: 0,
    nombreComunidad: '',
    ubicacionComunidad: '',

    motivoVisita: '',
    contacto: '',

    conceptoTrabajo: '',
    observaciones: '',

    horaEntrada: '',
    duracion: '',

    operario: [],
    materiales: [],

    fotos: [],
    firma: null
  };

  private idBorrador: string | null = null;

  constructor(
    private indexedDbService: IndexedDbService
  ) { }

  getReport(): Report {
    return this.report;
  }

  setReport(report: Report): void {
    this.report = report;
  }

  async guardarBorrador(): Promise<void> {

    this.idBorrador =
      await this.indexedDbService.guardarParte(
        this.report,
        this.idBorrador ?? undefined,
        'BORRADOR'
      );

    console.log(
      'Borrador guardado localmente:',
      this.idBorrador
    );
  }

  async marcarPendienteEnvio(): Promise<void> {

    if (!this.idBorrador) {

      this.idBorrador =
        await this.indexedDbService.guardarParte(
          this.report,
          undefined,
          'PENDIENTE_ENVIO'
        );

      return;
    }

    await this.indexedDbService.guardarParte(
      this.report,
      this.idBorrador,
      'PENDIENTE_ENVIO'
    );
  }

  async recuperarBorrador(
    id: string
  ): Promise<boolean> {

    const borrador =
      await this.indexedDbService.obtenerParte(id);

    if (!borrador) {
      return false;
    }

    this.report = borrador.report;
    this.idBorrador = borrador.id;

    return true;
  }

  async eliminarBorrador(): Promise<void> {

    if (!this.idBorrador) {
      return;
    }

    await this.indexedDbService.eliminarParte(
      this.idBorrador
    );

    this.idBorrador = null;

    this.limpiar();
  }

  limpiar(): void {

    this.report = {

      idComunidad: 0,
      nombreComunidad: '',
      ubicacionComunidad: '',

      motivoVisita: '',
      contacto: '',

      conceptoTrabajo: '',
      observaciones: '',

      horaEntrada: '',
      duracion: '',

      operario: [],
      materiales: [],

      fotos: [],
      firma: null
    };
  }
  async obtenerPartesEnProceso() {
    return await this.indexedDbService.obtenerPartesEnProceso();
  }
  nuevoParte(): void {

    this.report = {
      idComunidad: 0,
      nombreComunidad: '',
      ubicacionComunidad: '',
      motivoVisita: '',
      contacto: '',
      conceptoTrabajo: '',
      observaciones: '',
      horaEntrada: '',
      duracion: '',
      operario: [],
      materiales: [],
      fotos: [],
      firma: null
    };

    this.idBorrador = null;
  }
  async cargarBorrador(id: string): Promise<boolean> {

    const borrador =
        await this.indexedDbService.obtenerParte(id);

    if (!borrador) {
        return false;
    }

    this.report = borrador.report;
    this.idBorrador = borrador.id;

    return true;
}
}