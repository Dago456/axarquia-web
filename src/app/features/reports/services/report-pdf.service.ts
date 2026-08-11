import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

import { Report } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportPdfService {

  private readonly AZUL_OSCURO = '#12304A';
  private readonly AZUL_SECUNDARIO = '#1D4E6E';
  private readonly AZUL_CLARO = '#EAF3F8';
  private readonly GRIS_TEXTO = '#4B5563';
  private readonly GRIS_CLARO = '#F3F6F8';
  private readonly GRIS_BORDE = '#D8E0E5';

  private readonly MARGEN_X = 15;
  private readonly ANCHO_CONTENIDO = 180;

  async generarPdf(report: Report): Promise<Blob> {

      const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
      });

      /*
       * HEADER
       */
      await this.dibujarEncabezado(pdf, report);

      let y = 58;

      /*
       * INFORMACIÓN
       */
      y = this.dibujarInformacionComunidad(
          pdf,
          report,
          y
      );

      y = this.dibujarInformacionServicio(
          pdf,
          report,
          y
      );

      y = this.dibujarConceptoTrabajo(
          pdf,
          report,
          y
      );

      y = this.dibujarObservaciones(
          pdf,
          report,
          y
      );

      y = this.dibujarMateriales(
          pdf,
          report,
          y
      );

      y = this.dibujarOperarios(
          pdf,
          report,
          y
      );

      /*
       * FOTOS
       */
      if (report.fotos && report.fotos.length > 0) {

          y = this.verificarEspacio(
              pdf,
              y,
              90
          );

          y = await this.dibujarFotos(
              pdf,
              report,
              y
          );
      }

      /*
       * FIRMA
       */
      if (report.firma) {

          y = this.verificarEspacio(
              pdf,
              y,
              65
          );

          y = this.dibujarFirma(
              pdf,
              report,
              y
          );
      }

      /*
       * PIE DE PÁGINA
       */
      this.dibujarPieDePagina(pdf);

      return pdf.output('blob');
  }

  descargarPdf(report: Report): void {

      this.generarPdf(report)
          .then(blob => {

              const url =
                  URL.createObjectURL(blob);

              const enlace =
                  document.createElement('a');

              enlace.href = url;

              enlace.download =
                  `parte-${report.idComunidad}.pdf`;

              enlace.click();

              URL.revokeObjectURL(url);

          })
          .catch(error => {

              console.error(
                  'Error generando PDF:',
                  error
              );

          });
  }

  // =========================================================
  // HEADER
  // =========================================================

  private async dibujarEncabezado(
      pdf: jsPDF,
      report: Report
  ): Promise<void> {

      const ancho =
          pdf.internal.pageSize.getWidth();

      /*
       * Fondo del encabezado
       */

      pdf.setFillColor(
          this.AZUL_OSCURO
      );

      pdf.rect(
          0,
          0,
          ancho,
          42,
          'F'
      );

      /*
       * Logo
       */

      try {

          const logo =
              await this.cargarImagen(
                  '/images/logoredondo.png'
              );

          pdf.addImage(
              logo,
              'PNG',
              15,
              7,
              30,
              24
          );

      } catch (error) {

          console.warn(
              'No se pudo cargar el logo:',
              error
          );

      }

      /*
       * Nombre empresa
       */

      pdf.setTextColor(
          '#FFFFFF'
      );

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(13);

      pdf.text(
          'MANTENIMIENTOS INTEGRALES',
          50,
          13
      );

      pdf.text(
          'LA AXARQUIA S.L.',
          50,
          20
      );

      /*
       * Información empresa
       */

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(7);

      pdf.text(
          'Servicios integrales de mantenimiento',
          50,
          27
      );

      pdf.text(
          'Málaga · España',
          50,
          33
      );

      /*
       * Información del parte
       */

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(8);

      // pdf.text(
      //     `PARTE #${report.idComunidad}`,
      //     ancho - 15,
      //     13,
      //     {
      //         align: 'right'
      //     }
      // );

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.text(
          'REPORTE DE SERVICIO',
          ancho - 15,
          20,
          {
              align: 'right'
          }
      );

      const fecha =
          new Date().toLocaleDateString(
              'es-ES'
          );

      pdf.text(
          fecha,
          ancho - 15,
          27,
          {
              align: 'right'
          }
      );
  }

  // =========================================================
  // COMUNIDAD
  // =========================================================

  private dibujarInformacionComunidad(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'INFORMACIÓN DE LA COMUNIDAD',
          y
      );

      pdf.setFillColor(
          this.AZUL_CLARO
      );

      pdf.roundedRect(
          15,
          y - 3,
          180,
          25,
          2,
          2,
          'F'
      );

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(11);

      pdf.setTextColor(
          this.AZUL_OSCURO
      );

      pdf.text(
          report.nombreComunidad ||
          'Sin nombre',
          20,
          y + 6
      );

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(9);

      pdf.setTextColor(
          this.GRIS_TEXTO
      );

      pdf.text(
          report.ubicacionComunidad ||
          'Sin ubicación',
          20,
          y + 14
      );

      return y + 32;
  }

  // =========================================================
  // INFORMACIÓN SERVICIO
  // =========================================================

  private dibujarInformacionServicio(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'INFORMACIÓN DEL SERVICIO',
          y
      );

      const columnas = [
          {
              titulo: 'Motivo de visita',
              valor: report.motivoVisita
          },
          {
              titulo: 'Contacto',
              valor: report.contacto
          },
          {
              titulo: 'Hora de entrada',
              valor: report.horaEntrada
          },
          {
              titulo: 'Duración',
              valor: report.duracion
          }
      ];

      const anchoColumna = 45;

      columnas.forEach(
          (columna, index) => {

              const x =
                  15 +
                  index * anchoColumna;

              pdf.setFillColor(
                  this.GRIS_CLARO
              );

              pdf.setDrawColor(
                  this.GRIS_BORDE
              );

              pdf.roundedRect(
                  x,
                  y,
                  42,
                  25,
                  2,
                  2,
                  'FD'
              );

              pdf.setFont(
                  'helvetica',
                  'bold'
              );

              pdf.setFontSize(7);

              pdf.setTextColor(
                  this.GRIS_TEXTO
              );

              pdf.text(
                  columna.titulo,
                  x + 3,
                  y + 7
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(8);

              pdf.setTextColor(
                  this.AZUL_OSCURO
              );

              const valor =
                  columna.valor ||
                  'No registrado';

              const lineas =
                  pdf.splitTextToSize(
                      valor,
                      35
                  );

              pdf.text(
                  lineas,
                  x + 3,
                  y + 15
              );
          }
      );

      return y + 34;
  }

  // =========================================================
  // CONCEPTO
  // =========================================================

  private dibujarConceptoTrabajo(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'CONCEPTO DEL TRABAJO',
          y
      );

      const texto =
          report.conceptoTrabajo ||
          'Sin información registrada.';

      return this.dibujarTextoEnCaja(
          pdf,
          texto,
          y
      );
  }

  // =========================================================
  // OBSERVACIONES
  // =========================================================

  private dibujarObservaciones(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'OBSERVACIONES',
          y
      );

      const texto =
          report.observaciones ||
          'Sin observaciones.';

      return this.dibujarTextoEnCaja(
          pdf,
          texto,
          y
      );
  }

  // =========================================================
  // MATERIALES
  // =========================================================

  private dibujarMateriales(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'MATERIALES',
          y
      );

      if (
          !report.materiales ||
          report.materiales.length === 0
      ) {

          pdf.setFont(
              'helvetica',
              'normal'
          );

          pdf.setFontSize(9);

          pdf.setTextColor(
              this.GRIS_TEXTO
          );

          pdf.text(
              'No se registraron materiales.',
              15,
              y
          );

          return y + 10;
      }

      report.materiales.forEach(
          material => {

              pdf.setFillColor(
                  this.AZUL_SECUNDARIO
              );

              pdf.circle(
                  18,
                  y - 1.5,
                  1,
                  'F'
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(9);

              pdf.setTextColor(
                  this.GRIS_TEXTO
              );

              pdf.text(
                  material,
                  23,
                  y
              );

              y += 6;
          }
      );

      return y + 5;
  }

  // =========================================================
  // OPERARIOS
  // =========================================================

  private dibujarOperarios(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'OPERARIOS',
          y
      );

      if (
          !report.operario ||
          report.operario.length === 0
      ) {

          pdf.setFont(
              'helvetica',
              'normal'
          );

          pdf.setFontSize(9);

          pdf.setTextColor(
              this.GRIS_TEXTO
          );

          pdf.text(
              'No se registraron operarios.',
              15,
              y
          );

          return y + 10;
      }

      report.operario.forEach(
          operario => {

              pdf.setFillColor(
                  this.AZUL_SECUNDARIO
              );

              pdf.circle(
                  18,
                  y - 1.5,
                  1,
                  'F'
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(9);

              pdf.setTextColor(
                  this.GRIS_TEXTO
              );

              pdf.text(
                  operario,
                  23,
                  y
              );

              y += 6;
          }
      );

      return y + 5;
  }

  // =========================================================
  // FOTOS
  // =========================================================

  private async dibujarFotos(
      pdf: jsPDF,
      report: Report,
      y: number
  ): Promise<number> {

      y = this.tituloSeccion(
          pdf,
          'REGISTRO FOTOGRÁFICO',
          y
      );

      const anchoFoto = 82;
      const altoFoto = 60;
      const espacio = 10;

      let columna = 0;

      for (
          const foto of report.fotos
      ) {

          if (columna === 0) {

              y = this.verificarEspacio(
                  pdf,
                  y,
                  altoFoto + 10
              );
          }

          const x =
              columna === 0
                  ? 15
                  : 15 + anchoFoto + espacio;

          try {

              const dataUrl =
                  await this.fileToDataUrl(
                      foto
                  );

              const formato =
                  this.obtenerFormatoImagen(
                      foto.type
                  );

              pdf.setDrawColor(
                  this.GRIS_BORDE
              );

              pdf.rect(
                  x,
                  y,
                  anchoFoto,
                  altoFoto
              );

              pdf.addImage(
                  dataUrl,
                  formato,
                  x,
                  y,
                  anchoFoto,
                  altoFoto,
                  undefined,
                  'MEDIUM'
              );

          } catch (error) {

              console.error(
                  'Error agregando fotografía:',
                  error
              );
          }

          columna++;

          if (columna === 2) {

              columna = 0;

              y +=
                  altoFoto +
                  10;
          }
      }

      if (columna !== 0) {

          y +=
              altoFoto +
              10;
      }

      return y;
  }

  // =========================================================
  // FIRMA
  // =========================================================

  private dibujarFirma(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'FIRMA DE CONFORMIDAD',
          y
      );

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
          this.GRIS_TEXTO
      );

      pdf.text(
          'Firma del responsable',
          15,
          y
      );

      const x = 15;
      const ancho = 80;
      const alto = 45;

      pdf.setDrawColor(
          this.GRIS_BORDE
      );

      pdf.rect(
          x,
          y + 4,
          ancho,
          alto
      );

      if (report.firma) {

          try {

              pdf.addImage(
                  report.firma,
                  'PNG',
                  x + 3,
                  y + 7,
                  ancho - 6,
                  alto - 10,
                  undefined,
                  'MEDIUM'
              );

          } catch (error) {

              console.error(
                  'Error agregando firma:',
                  error
              );
          }
      }

      return y + 58;
  }

  // =========================================================
  // TÍTULO DE SECCIÓN
  // =========================================================

  private tituloSeccion(
      pdf: jsPDF,
      titulo: string,
      y: number
  ): number {

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
          this.AZUL_OSCURO
      );

      pdf.text(
          titulo,
          15,
          y
      );

      pdf.setDrawColor(
          this.AZUL_SECUNDARIO
      );

      pdf.setLineWidth(
          0.5
      );

      pdf.line(
          15,
          y + 3,
          195,
          y + 3
      );

      return y + 10;
  }

  // =========================================================
  // TEXTO EN CAJA
  // =========================================================

  private dibujarTextoEnCaja(
      pdf: jsPDF,
      texto: string,
      y: number
  ): number {

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(9);

      pdf.setTextColor(
          this.GRIS_TEXTO
      );

      const lineas =
          pdf.splitTextToSize(
              texto,
              170
          );

      const alto =
          Math.max(
              15,
              lineas.length * 5 + 8
          );

      pdf.setFillColor(
          this.GRIS_CLARO
      );

      pdf.roundedRect(
          15,
          y - 4,
          180,
          alto,
          2,
          2,
          'F'
      );

      pdf.text(
          lineas,
          20,
          y + 3
      );

      return y + alto + 5;
  }

  // =========================================================
  // CONTROL DE PÁGINA
  // =========================================================

  private verificarEspacio(
      pdf: jsPDF,
      y: number,
      espacioNecesario: number
  ): number {

      const altoPagina =
          pdf.internal.pageSize.getHeight();

      const limite =
          altoPagina - 25;

      if (
          y + espacioNecesario >
          limite
      ) {

          pdf.addPage();

          this.dibujarHeaderPagina(
              pdf
          );

          return 52;
      }

      return y;
  }

  // =========================================================
  // HEADER DE PÁGINAS SIGUIENTES
  // =========================================================

  private dibujarHeaderPagina(
      pdf: jsPDF
  ): void {

      const ancho =
          pdf.internal.pageSize.getWidth();

      pdf.setFillColor(
          this.AZUL_OSCURO
      );

      pdf.rect(
          0,
          0,
          ancho,
          25,
          'F'
      );

      pdf.setTextColor(
          '#FFFFFF'
      );

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(9);

      pdf.text(
          'MANTENIMIENTOS INTEGRALES LA AXARQUIA S.L.',
          15,
          15
      );
  }

  // =========================================================
  // PIE
  // =========================================================

  private dibujarPieDePagina(
      pdf: jsPDF
  ): void {

      const totalPaginas =
          pdf.getNumberOfPages();

      const alto =
          pdf.internal.pageSize.getHeight();

      const ancho =
          pdf.internal.pageSize.getWidth();

      for (
          let pagina = 1;
          pagina <= totalPaginas;
          pagina++
      ) {

          pdf.setPage(
              pagina
          );

          pdf.setFillColor(
              this.AZUL_OSCURO
          );

          pdf.rect(
              0,
              alto - 12,
              ancho,
              12,
              'F'
          );

          pdf.setTextColor(
              '#FFFFFF'
          );

          pdf.setFont(
              'helvetica',
              'normal'
          );

          pdf.setFontSize(7);

          pdf.text(
              'AXARQUIA · MANTENIMIENTOS INTEGRALES',
              15,
              alto - 5
          );

          pdf.text(
              `Página ${pagina} de ${totalPaginas}`,
              ancho - 15,
              alto - 5,
              {
                  align: 'right'
              }
          );
      }
  }

  // =========================================================
  // IMÁGENES
  // =========================================================

  private cargarImagen(
      url: string
  ): Promise<string> {

      return new Promise(
          (resolve, reject) => {

              const imagen =
                  new Image();

              imagen.onload = () => {

                  const canvas =
                      document.createElement(
                          'canvas'
                      );

                  canvas.width =
                      imagen.width;

                  canvas.height =
                      imagen.height;

                  const contexto =
                      canvas.getContext(
                          '2d'
                      );

                  if (!contexto) {

                      reject(
                          'No se pudo crear canvas'
                      );

                      return;
                  }

                  contexto.drawImage(
                      imagen,
                      0,
                      0
                  );

                  resolve(
                      canvas.toDataURL(
                          'image/png'
                      )
                  );
              };

              imagen.onerror =
                  reject;

              imagen.src = url;
          }
      );
  }

  private fileToDataUrl(
      file: File
  ): Promise<string> {

      return new Promise(
          (resolve, reject) => {

              const reader =
                  new FileReader();

              reader.onload = () => {

                  resolve(
                      reader.result as string
                  );
              };

              reader.onerror =
                  reject;

              reader.readAsDataURL(
                  file
              );
          }
      );
  }

  private obtenerFormatoImagen(
      mimeType: string
  ): 'PNG' | 'JPEG' {

      if (
          mimeType
              .toLowerCase()
              .includes('png')
      ) {

          return 'PNG';
      }

      return 'JPEG';
  }
}