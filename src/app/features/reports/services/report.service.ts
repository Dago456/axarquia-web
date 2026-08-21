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

    fecha: this.fechaHoy(),

    horaEntrada: '',
    horaFinalizacion: '',
    duracion: '',

    operario: [],
    materiales: [],

    fotos: [],

    // Firma del cliente
    firma: null,

    // Firma del operario
    firmaOperario: null
  };

  private idBorrador: string | null = null;

  constructor(
    private indexedDbService: IndexedDbService
  ) { }


  private fechaHoy(): string {

    return new Date()
      .toISOString()
      .slice(0, 10);

  }


  getReport(): Report {
    return this.report;
  }


  setReport(report: Report): void {

    this.report = {
      ...report,

      // Compatibilidad con borradores antiguos
      fecha: report.fecha ?? this.fechaHoy(),
      firma: report.firma ?? null,
      firmaOperario: report.firmaOperario ?? null
    };

  }


  async guardarBorrador(): Promise<void> {

    this.idBorrador =
      await this.indexedDbService.guardarParte(
        this.report,
        this.idBorrador ?? undefined,
        'BORRADOR'
      );

    console.log(
      '✓ Borrador guardado localmente:',
      this.idBorrador
    );
  }


  async marcarPendienteEnvio(): Promise<void> {

    this.idBorrador =
      await this.indexedDbService.guardarParte(
        this.report,
        this.idBorrador ?? undefined,
        'PENDIENTE_ENVIO'
      );

    console.log(
      '📦 Parte marcado como pendiente de envío:',
      this.idBorrador
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

    this.report = {
      ...borrador.report,

      // Importante:
      // permite recuperar firmas de borradores nuevos
      // y evita undefined en borradores antiguos.
      fecha: borrador.report.fecha ?? this.fechaHoy(),
      firma: borrador.report.firma ?? null,
      firmaOperario: borrador.report.firmaOperario ?? null
    };

    this.idBorrador = borrador.id;

    console.log(
      '📄 Borrador recuperado:',
      this.report
    );

    console.log(
      '✍️ Firma operario recuperada:',
      !!this.report.firmaOperario
    );

    return true;
  }


  async cargarBorrador(
    id: string
  ): Promise<boolean> {

    const borrador =
      await this.indexedDbService.obtenerParte(id);

    if (!borrador) {
      return false;
    }

    this.report = {
      ...borrador.report,

      fecha: borrador.report.fecha ?? this.fechaHoy(),
      firma: borrador.report.firma ?? null,
      firmaOperario: borrador.report.firmaOperario ?? null
    };

    this.idBorrador = borrador.id;

    console.log(
      '📄 Borrador cargado:',
      this.report
    );

    console.log(
      '✍️ Firma operario:',
      !!this.report.firmaOperario
    );

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

      fecha: this.fechaHoy(),

      horaEntrada: '',
      horaFinalizacion: '',
      duracion: '',

      operario: [],
      materiales: [],

      fotos: [],

      firma: null,
      firmaOperario: null
    };

    this.idBorrador = null;
  }


  async obtenerPartesEnProceso() {
    const partes =
      await this.indexedDbService.obtenerPartesEnProceso();

    return partes.filter(
      parte => parte.report.idComunidad !== 0
    );
  }
  
  async obtenerPartesSinComunidad() {

    const partes =
      await this.indexedDbService.obtenerPartesEnProceso();

    return partes.filter(
      parte => parte.report.idComunidad === 0
    );
  }

  async obtenerBorradorSinComunidad() {

    const partes =
        await this.indexedDbService.obtenerPartesEnProceso();

    return partes.find(
        parte => parte.report.idComunidad === 0
    );
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

      fecha: this.fechaHoy(),

      horaEntrada: '',
      horaFinalizacion: '',
      duracion: '',

      operario: [],
      materiales: [],

      fotos: [],

      firma: null,

      // IMPORTANTE
      firmaOperario: null
    };

    this.idBorrador = null;
  }

  nuevoParteSinComunidad(): void {

    this.report = {

      // IMPORTANTE:
      // 0 identifica un reporte sin comunidad
      idComunidad: 0,

      nombreComunidad: '',
      ubicacionComunidad: '',

      motivoVisita: '',
      contacto: '',

      conceptoTrabajo: '',
      observaciones: '',

      fecha: this.fechaHoy(),

      horaEntrada: '',
      horaFinalizacion: '',
      duracion: '',

      operario: [],
      materiales: [],

      fotos: [],

      firma: null,
      firmaOperario: null
    };

    this.idBorrador = null;

  }

}