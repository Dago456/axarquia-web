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

  async generarPdf(report: Report, idParte?: number | null): Promise<Blob> {

      const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
      });

      const fecha =
          new Date().toLocaleDateString('es-ES');

      /*
       * HEADER
       */
      await this.dibujarEncabezado(pdf, fecha);

      let y = 40;

      /*
       * INFORMACIÓN
       */
      y = this.dibujarInformacionComunidad(
          pdf,
          report,
          y
      );

      y = this.dibujarInformacionParte(
          pdf,
          report,
          fecha,
          y
      );

      y = this.dibujarOperarios(
          pdf,
          report,
          y
      );

      y = this.dibujarMateriales(
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
              62
          );

          y = await this.dibujarFotos(
              pdf,
              report,
              y
          );
      }

      /*
       * FIRMAS
       */
      if (report.firma || report.firmaOperario) {

          y = this.verificarEspacio(
              pdf,
              y,
              45
          );

          y = this.dibujarFirmas(
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

  descargarPdf(report: Report, idParte?: number | null): void {

      this.generarPdf(report, idParte)
          .then(blob => {

              const url =
                  URL.createObjectURL(blob);

              const enlace =
                  document.createElement('a');

              enlace.href = url;

              enlace.download =
                  idParte
                      ? `parte-${idParte}.pdf`
                      : `parte-${report.idComunidad}.pdf`;

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
      fecha: string
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
          32,
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
              5,
              22,
              22
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

      pdf.setFontSize(12);

      pdf.text(
          'MANTENIMIENTOS INTEGRALES',
          43,
          11
      );

      pdf.text(
          'LA AXARQUIA S.L.',
          43,
          17
      );

      /*
       * Información de contacto de la empresa
       */

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(6.5);

      pdf.text(
          'Tel: 951 13 76 28 · 684 20 00 22',
          43,
          23
      );

      pdf.text(
          'Correo: axarquiamantenimientos@gmail.com',
          43,
          28
      );

      /*
       * Etiqueta del reporte
       */

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(8);

      pdf.text(
          'PARTE DE TRABAJO',
          ancho - 15,
          15,
          {
              align: 'right'
          }
      );

      pdf.text(
          fecha,
          ancho - 15,
          21,
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

      const altoBox = 21;

      pdf.setFillColor(
          this.AZUL_CLARO
      );

      pdf.roundedRect(
          15,
          y - 3,
          180,
          altoBox,
          2,
          2,
          'F'
      );

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(10.5);

      pdf.setTextColor(
          this.AZUL_OSCURO
      );

      pdf.text(
          `${report.nombreComunidad || 'Sin nombre'}  ·  ID: ${report.idComunidad || '-'}`,
          20,
          y + 4
      );

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(8)

      pdf.setTextColor(
          this.GRIS_TEXTO
      );

      pdf.text(
          `Ubicación: ${report.ubicacionComunidad || 'Sin ubicación'}`,
          20,
          y + 10
      );

      pdf.text(
          `Contacto: ${report.contacto || 'No registrado'}`,
          20,
          y + 15.5
      );

      return y + altoBox + 5;
  }

  // =========================================================
  // INFORMACIÓN DEL PARTE
  // =========================================================

  private dibujarInformacionParte(
      pdf: jsPDF,
      report: Report,
      fecha: string,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'INFORMACIÓN DEL PARTE',
          y
      );

      const campos = [
          {
              titulo: 'Fecha',
              valor: fecha
          },
          {
              titulo: 'Hora de entrada',
              valor: report.horaEntrada
          },
          {
              titulo: 'Hora de salida',
              valor: report.horaFinalizacion
          },
          {
              titulo: 'Duración',
              valor: report.duracion
          }
      ];

      y = this.dibujarFichaCampos(
          pdf,
          campos,
          y
      );

      y = this.dibujarCampoTexto(
          pdf,
          'Motivo de visita',
          report.motivoVisita,
          y
      );

      y = this.dibujarCampoTexto(
          pdf,
          'Concepto del trabajo',
          report.conceptoTrabajo,
          y
      );

      y = this.dibujarCampoTexto(
          pdf,
          'Observaciones',
          report.observaciones,
          y
      );

      return y;
  }

  // =========================================================
  // FICHA DE CAMPOS CORTOS (grilla de hasta 4 por fila)
  // =========================================================

  private dibujarFichaCampos(
      pdf: jsPDF,
      campos: { titulo: string; valor: string | null }[],
      y: number
  ): number {

      const columnasPorFila = 4;

      const anchoColumna =
          this.ANCHO_CONTENIDO / columnasPorFila;

      const altoFila = 17;

      campos.forEach(
          (campo, index) => {

              const columna = index % columnasPorFila;

              const fila = Math.floor(index / columnasPorFila);

              if (columna === 0 && fila > 0) {

                  y += altoFila + 3;
              }

              const x =
                  this.MARGEN_X +
                  columna * anchoColumna;

              pdf.setFillColor(
                  this.GRIS_CLARO
              );

              pdf.setDrawColor(
                  this.GRIS_BORDE
              );

              pdf.roundedRect(
                  x,
                  y,
                  anchoColumna - 3,
                  altoFila,
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
                  campo.titulo,
                  x + 2.5,
                  y + 6
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(7.8);

              pdf.setTextColor(
                  this.AZUL_OSCURO
              );

              const valor =
                  campo.valor ||
                  'No registrado';

              const lineas =
                  pdf.splitTextToSize(
                      valor,
                      anchoColumna - 6
                  );

              pdf.text(
                  lineas,
                  x + 2.5,
                  y + 12
              );
          }
      );

      return y + altoFila + 5;
  }

  // =========================================================
  // CAMPO DE TEXTO LARGO (etiqueta + caja)
  // =========================================================

  private dibujarCampoTexto(
      pdf: jsPDF,
      etiqueta: string,
      valor: string,
      y: number
  ): number {

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
          this.AZUL_SECUNDARIO
      );

      pdf.text(
          etiqueta,
          this.MARGEN_X,
          y
      );

      y += 4;

      const texto =
          valor ||
          'Sin información registrada.';

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
          'MATERIALES UTILIZADOS',
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

          return y + 7;
      }

      report.materiales.forEach(
          material => {

              pdf.setFillColor(
                  this.AZUL_SECUNDARIO
              );

              pdf.circle(
                  18,
                  y - 1.2,
                  0.9,
                  'F'
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(8.3);

              pdf.setTextColor(
                  this.GRIS_TEXTO
              );

              pdf.text(
                  material,
                  23,
                  y
              );

              y += 4.8;
          }
      );

      return y + 3;
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

          return y + 7;
      }

      report.operario.forEach(
          operario => {

              pdf.setFillColor(
                  this.AZUL_SECUNDARIO
              );

              pdf.circle(
                  18,
                  y - 1.2,
                  0.9,
                  'F'
              );

              pdf.setFont(
                  'helvetica',
                  'normal'
              );

              pdf.setFontSize(8.3);

              pdf.setTextColor(
                  this.GRIS_TEXTO
              );

              pdf.text(
                  operario,
                  23,
                  y
              );

              y += 4.8;
          }
      );

      return y + 3;
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
          'FOTOGRAFÍAS DEL TRABAJO',
          y
      );

      const anchoFoto = 82;
      const altoFoto = 46;
      const espacio = 8;

      let columna = 0;

      for (
          const foto of report.fotos
      ) {

          if (columna === 0) {

              y = this.verificarEspacio(
                  pdf,
                  y,
                  altoFoto + 6
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
                  6;
          }
      }

      if (columna !== 0) {

          y +=
              altoFoto +
              6;
      }

      return y;
  }

  // =========================================================
  // FIRMAS (operario + cliente, lado a lado)
  // =========================================================

  private dibujarFirmas(
      pdf: jsPDF,
      report: Report,
      y: number
  ): number {

      y = this.tituloSeccion(
          pdf,
          'FIRMAS',
          y
      );

      const anchoFirma = 82;
      const altoFirma = 30;
      const espacio = 10;

      const xOperario = this.MARGEN_X;
      const xCliente = this.MARGEN_X + anchoFirma + espacio;

      this.dibujarCajaFirma(
          pdf,
          xOperario,
          y,
          anchoFirma,
          altoFirma,
          report.firmaOperario,
          'Firma del operario'
      );

      this.dibujarCajaFirma(
          pdf,
          xCliente,
          y,
          anchoFirma,
          altoFirma,
          report.firma,
          'Firma del cliente'
      );

      return y + altoFirma + 8;
  }

  private dibujarCajaFirma(
      pdf: jsPDF,
      x: number,
      y: number,
      ancho: number,
      alto: number,
      firma: string | null,
      etiqueta: string
  ): void {

      pdf.setDrawColor(
          this.GRIS_BORDE
      );

      pdf.rect(
          x,
          y,
          ancho,
          alto
      );

      if (firma) {

          try {

              pdf.addImage(
                  firma,
                  'PNG',
                  x + 3,
                  y + 3,
                  ancho - 6,
                  alto - 6,
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

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
          this.GRIS_TEXTO
      );

      pdf.text(
          etiqueta,
          x + ancho / 2,
          y + alto + 6,
          {
              align: 'center'
          }
      );
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

      pdf.setFontSize(9.5);

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
          y + 2,
          195,
          y + 2
      );

      return y + 7;
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

      pdf.setFontSize(8.3);

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
              9,
              lineas.length * 4 + 5
          );

      pdf.setFillColor(
          this.GRIS_CLARO
      );

      pdf.roundedRect(
          15,
          y - 3,
          180,
          alto,
          2,
          2,
          'F'
      );

      pdf.text(
          lineas,
          20,
          y + 2
      );

      return y + alto + 3;
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
