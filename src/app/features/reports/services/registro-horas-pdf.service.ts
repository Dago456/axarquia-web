import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

import {
    ReporteHorasRespuesta
} from '../pages/reporte-horas/reporte-horas.component';

@Injectable({
    providedIn: 'root'
})
export class RegistroHorasPdfService {

    private readonly AZUL_OSCURO = '#12304A';
    private readonly GRIS_TEXTO = '#4B5563';
    private readonly GRIS_CLARO = '#F3F6F8';
    private readonly GRIS_BORDE = '#D8E0E5';

    private readonly MARGEN_X = 15;

    descargarReporte(
        resultado: ReporteHorasRespuesta,
        modo: 'individual' | 'grupal'
    ): void {

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const ancho = pdf.internal.pageSize.getWidth();

        pdf.setFillColor(this.AZUL_OSCURO);
        pdf.rect(0, 0, ancho, 28, 'F');

        pdf.setTextColor('#FFFFFF');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text('REPORTE DE HORAS', 15, 14);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        const etiquetaModo =
            modo === 'individual' ? 'Individual' : 'Grupal (todos los operarios)';

        pdf.text(
            `${etiquetaModo} · ${resultado.fecha_inicio} — ${resultado.fecha_fin}`,
            15,
            22
        );

        let y = 40;

        if (resultado.operarios.length === 0) {

            pdf.setTextColor(this.GRIS_TEXTO);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text(
                'No hay tareas finalizadas en ese rango de fechas.',
                15,
                y
            );

        }

        resultado.operarios.forEach(operario => {

            y = this.verificarEspacio(pdf, y, 20);

            pdf.setFillColor(this.GRIS_CLARO);
            pdf.roundedRect(15, y - 5, 180, 12, 2, 2, 'F');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(this.AZUL_OSCURO);
            pdf.text(operario.nombre_operario, 19, y + 2);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(this.GRIS_TEXTO);
            pdf.text(
                `Total: ${this.formatearDuracion(operario.total_operario_segundos)}`,
                193,
                y + 2,
                { align: 'right' }
            );

            y += 14;

            operario.dias.forEach(dia => {

                const lineasTareas = dia.tareas.map(
                    tarea =>
                        `${tarea.nombre_tarea}: ${this.formatearHora(tarea.hora_inicio)} - ${this.formatearHora(tarea.hora_fin)} (${this.formatearDuracion(tarea.duracion_segundos)})`
                );

                const alto = Math.max(10, lineasTareas.length * 5 + 6);

                y = this.verificarEspacio(pdf, y, alto + 4);

                pdf.setDrawColor(this.GRIS_BORDE);
                pdf.line(15, y - 2, 195, y - 2);

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.setTextColor(this.AZUL_OSCURO);
                pdf.text(dia.fecha, 15, y + 3);

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8.5);
                pdf.setTextColor(this.GRIS_TEXTO);
                pdf.text(lineasTareas, 50, y + 3);

                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(this.AZUL_OSCURO);
                pdf.text(
                    this.formatearDuracion(dia.total_dia_segundos),
                    195,
                    y + 3,
                    { align: 'right' }
                );

                y += alto;

            });

            y += 8;

        });

        this.dibujarPieDePagina(pdf);

        pdf.save(
            `reporte-horas-${resultado.fecha_inicio}-a-${resultado.fecha_fin}.pdf`
        );

    }

    private verificarEspacio(
        pdf: jsPDF,
        y: number,
        espacioNecesario: number
    ): number {

        const altoPagina = pdf.internal.pageSize.getHeight();

        if (y + espacioNecesario > altoPagina - 20) {

            pdf.addPage();

            return 20;

        }

        return y;

    }

    private dibujarPieDePagina(pdf: jsPDF): void {

        const totalPaginas = pdf.getNumberOfPages();

        const alto = pdf.internal.pageSize.getHeight();

        const ancho = pdf.internal.pageSize.getWidth();

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {

            pdf.setPage(pagina);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.setTextColor(this.GRIS_TEXTO);

            pdf.text(
                'AXARQUIA · MANTENIMIENTOS INTEGRALES',
                this.MARGEN_X,
                alto - 8
            );

            pdf.text(
                `Página ${pagina} de ${totalPaginas}`,
                ancho - 15,
                alto - 8,
                { align: 'right' }
            );

        }

    }

    private formatearDuracion(segundos: number): string {

        const horas = Math.floor(segundos / 3600);

        const minutos = Math.floor((segundos % 3600) / 60);

        if (horas > 0) {

            return `${horas} h ${minutos} min`;

        }

        return `${minutos} min`;

    }

    private formatearHora(hora: string | null): string {

        return hora ? hora.slice(0, 5) : '-';

    }

}
