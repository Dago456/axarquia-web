import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import { CommunityService } from '../../../../core/services/comunidadservice/comunidad.service';
import { EnvService } from '../../../../core/services/env.service';
import { Community } from '../../../scanner/models/community.model';


@Component({
    selector: 'app-historial-partes',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './historial-partes.component.html',
    styleUrl: './historial-partes.component.scss'
})
export class HistorialPartesComponent implements OnInit {

    private communityService = inject(CommunityService);
    private http = inject(HttpClient);
    private env = inject(EnvService);


    /* =====================================================
       COMUNIDADES
    ====================================================== */

    comunidades: Community[] = [];

    comunidadesFiltradas: Community[] = [];

    comunidadSeleccionada: Community | null = null;


    /* =====================================================
       BUSCADOR
    ====================================================== */

    textoBusqueda = '';


    /* =====================================================
       PARTES
    ====================================================== */

    partes: any[] = [];


    /* =====================================================
       MODAL
    ====================================================== */

    mostrarModal = false;


    /* =====================================================
       ESTADOS
    ====================================================== */

    cargandoComunidades = false;

    cargandoPartes = false;


    /* =====================================================
       INIT
    ====================================================== */

    ngOnInit(): void {

        this.cargarComunidades();

    }


    /* =====================================================
       CARGAR COMUNIDADES
    ====================================================== */

    cargarComunidades(): void {

        this.cargandoComunidades = true;

        this.communityService
            .getAllCommunities()
            .subscribe({

                next: (comunidades) => {

                    this.comunidades = comunidades;

                    this.comunidadesFiltradas = comunidades;

                    this.cargandoComunidades = false;

                },

                error: (error) => {

                    console.error(
                        'Error cargando comunidades:',
                        error
                    );

                    this.cargandoComunidades = false;

                }

            });

    }


    /* =====================================================
       BUSCAR COMUNIDADES
    ====================================================== */

    buscarComunidades(): void {

        const texto = this.textoBusqueda
            .trim()
            .toLowerCase();


        if (!texto) {

            this.comunidadesFiltradas = [
                ...this.comunidades
            ];

            return;

        }


        this.comunidadesFiltradas =
            this.comunidades.filter(comunidad => {

                const nombre =
                    comunidad.nom_comu
                        ?.toLowerCase() ?? '';


                const ubicacion =
                    comunidad.ubi_comu
                        ?.toLowerCase() ?? '';


                const id =
                    comunidad.id_comunidades
                        ?.toString() ?? '';


                return (

                    nombre.includes(texto) ||
                    ubicacion.includes(texto) ||
                    id.includes(texto)

                );

            });

    }


    /* =====================================================
       LIMPIAR BUSQUEDA
    ====================================================== */

    limpiarBusqueda(): void {

        this.textoBusqueda = '';

        this.comunidadesFiltradas = [
            ...this.comunidades
        ];

    }


    /* =====================================================
       SELECCIONAR COMUNIDAD
    ====================================================== */

    seleccionarComunidad(comunidad: Community): void {

        this.comunidadSeleccionada = comunidad;

        this.textoBusqueda = comunidad.nom_comu ?? '';

        this.comunidadesFiltradas = [];

    }


    /* =====================================================
       ABRIR HISTORIAL
    ====================================================== */

    abrirHistorial(): void {

        if (!this.comunidadSeleccionada) {
            return;
        }

        this.mostrarModal = true;

        this.cargarPartes(
            this.comunidadSeleccionada.id_comunidades
        );

    }


    /* =====================================================
       CARGAR PARTES
    ====================================================== */

    cargarPartes(idComunidad: number): void {

        this.cargandoPartes = true;

        this.partes = [];


        /*
         * Endpoint que ya tenemos planteado
         * para obtener los partes de una comunidad.
         *
         * Si tu route quedó con otra estructura,
         * solamente cambiamos esta URL.
         */

        const url =
            `${this.env.ENDPOINT_PRIMARY}/parte/comunidad/${idComunidad}`;


        this.http
            .get<any[]>(url)
            .subscribe({

                next: (partes) => {

                    this.partes = partes ?? [];

                    this.cargandoPartes = false;

                },

                error: (error) => {

                    console.error(
                        'Error cargando partes:',
                        error
                    );

                    this.partes = [];

                    this.cargandoPartes = false;

                }

            });

    }


    /* =====================================================
       CERRAR HISTORIAL
    ====================================================== */

    cerrarHistorial(): void {

        this.mostrarModal = false;

        this.partes = [];

    }


    /* =====================================================
       DESCARGAR PDF
    ====================================================== */

    descargarPDF(parte: any): void {

        const pdf = new jsPDF(
            'p',
            'mm',
            'a4'
        );


        const pageWidth =
            pdf.internal.pageSize.getWidth();


        const pageHeight =
            pdf.internal.pageSize.getHeight();


        /* =================================================
           COLORES
        ================================================== */

        const azul = '#10376A';

        const gris = '#6B7280';

        const grisClaro = '#F5F7FA';


        /* =================================================
           HEADER
        ================================================== */

        pdf.setFillColor(16, 55, 106);

        pdf.rect(
            0,
            0,
            pageWidth,
            30,
            'F'
        );


        pdf.setTextColor(255, 255, 255);

        pdf.setFontSize(20);

        pdf.setFont('helvetica', 'bold');

        pdf.text(
            'AXARQUIA',
            18,
            14
        );


        pdf.setFontSize(9);

        pdf.setFont('helvetica', 'normal');

        pdf.text(
            'Reporte de servicio',
            18,
            21
        );


        /* =================================================
           INFORMACIÓN PRINCIPAL
        ================================================== */

        let y = 43;


        pdf.setTextColor(23, 33, 58);

        pdf.setFontSize(18);

        pdf.setFont('helvetica', 'bold');

        pdf.text(
            'Información del reporte',
            18,
            y
        );


        y += 12;


        /* =================================================
           TARJETA INFORMACIÓN
        ================================================== */

        pdf.setFillColor(248, 250, 252);

        pdf.setDrawColor(220, 226, 234);

        pdf.roundedRect(
            18,
            y,
            pageWidth - 36,
            48,
            4,
            4,
            'FD'
        );


        const left = 24;

        const right = pageWidth / 2 + 5;


        let infoY = y + 10;


        pdf.setFontSize(8);

        pdf.setTextColor(107, 114, 128);

        pdf.setFont(
            'helvetica',
            'normal'
        );

        pdf.text(
            'ID REPORTE',
            left,
            infoY
        );


        pdf.text(
            'COMUNIDAD',
            right,
            infoY
        );


        infoY += 6;


        pdf.setFontSize(11);

        pdf.setTextColor(23, 33, 58);

        pdf.setFont(
            'helvetica',
            'bold'
        );


        pdf.text(
            `${parte.id_parte ?? '-'}`,
            left,
            infoY
        );


        pdf.text(
            `${parte.nom_comunidad ?? this.comunidadSeleccionada?.nom_comu ?? '-'}`,
            right,
            infoY,
            {
                maxWidth: 75
            }
        );


        infoY += 13;


        pdf.setFontSize(8);

        pdf.setTextColor(107, 114, 128);

        pdf.setFont(
            'helvetica',
            'normal'
        );


        pdf.text(
            'FECHA',
            left,
            infoY
        );


        pdf.text(
            'UBICACIÓN',
            right,
            infoY
        );


        infoY += 6;


        pdf.setFontSize(10);

        pdf.setTextColor(23, 33, 58);

        pdf.setFont(
            'helvetica',
            'bold'
        );


        pdf.text(
            `${parte.fecha_actual ?? '-'}`,
            left,
            infoY
        );


        pdf.text(
            `${parte.ubi_comunidad ?? this.comunidadSeleccionada?.ubi_comu ?? '-'}`,
            right,
            infoY,
            {
                maxWidth: 75
            }
        );


        y += 62;


        /* =================================================
           MOTIVO
        ================================================== */

        y = this.agregarSeccionPDF(
            pdf,
            'Motivo de visita',
            parte.motivo_visita,
            y
        );


        /* =================================================
           CONCEPTO
        ================================================== */

        y = this.agregarSeccionPDF(
            pdf,
            'Concepto de trabajo',
            parte.concepto_trabajo,
            y
        );


        /* =================================================
           CONTACTO
        ================================================== */

        y = this.agregarSeccionPDF(
            pdf,
            'Contacto',
            parte.contacto,
            y
        );


        /* =================================================
           OBSERVACIONES
        ================================================== */

        y = this.agregarSeccionPDF(
            pdf,
            'Observaciones',
            parte.observaciones,
            y
        );


        /* =================================================
           OPERARIOS
        ================================================== */

        if (
            parte.operario &&
            Array.isArray(parte.operario)
        ) {

            y = this.agregarSeccionPDF(
                pdf,
                'Operarios',
                parte.operario.join(', '),
                y
            );

        }


        /* =================================================
           MATERIALES
        ================================================== */

        if (
            parte.materiales &&
            Array.isArray(parte.materiales)
        ) {

            y = this.agregarSeccionPDF(
                pdf,
                'Materiales',
                parte.materiales.join(', '),
                y
            );

        }


        /* =================================================
           HORARIO
        ================================================== */

        if (
            parte.hora_entrada ||
            parte.duracion
        ) {

            if (y > pageHeight - 45) {

                pdf.addPage();

                y = 25;

            }


            pdf.setFontSize(13);

            pdf.setTextColor(23, 33, 58);

            pdf.setFont(
                'helvetica',
                'bold'
            );

            pdf.text(
                'Horario',
                18,
                y
            );


            y += 8;


            pdf.setFontSize(10);

            pdf.setFont(
                'helvetica',
                'normal'
            );


            if (parte.hora_entrada) {

                pdf.text(
                    `Hora de entrada: ${parte.hora_entrada}`,
                    18,
                    y
                );

                y += 6;

            }


            if (parte.duracion) {

                pdf.text(
                    `Duración: ${parte.duracion}`,
                    18,
                    y
                );

                y += 10;

            }

        }


        /* =================================================
           FOOTER
        ================================================== */

        pdf.setDrawColor(220, 226, 234);

        pdf.line(
            18,
            pageHeight - 20,
            pageWidth - 18,
            pageHeight - 20
        );


        pdf.setFontSize(8);

        pdf.setTextColor(107, 114, 128);

        pdf.setFont(
            'helvetica',
            'normal'
        );


        pdf.text(
            'Axarquia Mantenimientos',
            18,
            pageHeight - 13
        );


        pdf.text(
            `Reporte #${parte.id_parte ?? ''}`,
            pageWidth - 18,
            pageHeight - 13,
            {
                align: 'right'
            }
        );


        /* =================================================
           DESCARGAR
        ================================================== */

        pdf.save(
            `reporte-${parte.id_parte ?? 'sin-id'}.pdf`
        );

    }


    /* =====================================================
       SECCIÓN PDF
    ====================================================== */

    private agregarSeccionPDF(
        pdf: jsPDF,
        titulo: string,
        contenido: any,
        y: number
    ): number {

        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();


        if (
            contenido === null ||
            contenido === undefined ||
            contenido === ''
        ) {

            return y;

        }


        if (y > pageHeight - 55) {

            pdf.addPage();

            y = 25;

        }


        pdf.setFontSize(13);

        pdf.setTextColor(23, 33, 58);

        pdf.setFont(
            'helvetica',
            'bold'
        );


        pdf.text(
            titulo,
            18,
            y
        );


        y += 7;


        pdf.setFillColor(
            248,
            250,
            252
        );


        pdf.setDrawColor(
            225,
            230,
            237
        );


        const texto =
            String(contenido);


        pdf.setFontSize(10);

        pdf.setFont(
            'helvetica',
            'normal'
        );


        const lineas =
            pdf.splitTextToSize(
                texto,
                pageWidth - 48
            );


        const altura =
            Math.max(
                15,
                lineas.length * 5 + 8
            );


        pdf.roundedRect(
            18,
            y,
            pageWidth - 36,
            altura,
            3,
            3,
            'FD'
        );


        pdf.setTextColor(
            55,
            65,
            81
        );

        pdf.text(
            lineas,
            24,
            y + 8
        );

        return y + altura + 10;

    }

}