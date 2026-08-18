import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../core/services/comunidadservice/comunidad.service';
import { Community } from '../../../scanner/models/community.model';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
    selector: 'app-listas-qr',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './listas-qr.component.html',
    styleUrl: './listas-qr.component.scss'
})
export class ListasQrComponent implements OnInit {

    private communityService = inject(CommunityService);
    comunidades: Community[] = [];
    comunidadesFiltradas: Community[] = [];
    textoBusqueda = '';
    cargando = false;
    creandoComunidad = false;
    generandoPdf = false;
    modalCrearComunidad = false;
    errorCrearComunidad = '';
    nuevaComunidad: {
        id_comunidades: number | null;
        nom_comu: string;
        ubi_comu: string;
    } = {
            id_comunidades: null,
            nom_comu: '',
            ubi_comu: ''
        };

    ngOnInit(): void {
        this.cargarComunidades();
    }

    cargarComunidades(): void {
        this.cargando = true;
        this.communityService
            .getAllCommunities()
            .subscribe({
                next: (comunidades) => {
                    this.comunidades = comunidades;
                    this.comunidadesFiltradas = [
                        ...comunidades
                    ];
                    this.cargando = false;
                },
                error: (error) => {
                    console.error(
                        'Error cargando comunidades:',
                        error
                    );
                    this.cargando = false;
                }
            });
    }

    buscarComunidades(): void {
        const texto =
            this.textoBusqueda
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

    limpiarBusqueda(): void {
        this.textoBusqueda = '';
        this.comunidadesFiltradas = [
            ...this.comunidades
        ];

    }

    crearComunidad(): void {
        this.errorCrearComunidad = '';
        this.nuevaComunidad = {
            id_comunidades: null,
            nom_comu: '',
            ubi_comu: ''
        };
        this.modalCrearComunidad = true;
    }

    cerrarModalCrear(): void {
        if (this.creandoComunidad) {
            return;
        }
        this.modalCrearComunidad = false;
        this.errorCrearComunidad = '';
    }

    guardarComunidad(): void {
        this.errorCrearComunidad = '';
        if (
            this.nuevaComunidad.id_comunidades === null
        ) {
            this.errorCrearComunidad =
                'Debes ingresar el ID de la comunidad.';
            return;
        }

        if (
            !this.nuevaComunidad.nom_comu.trim()
        ) {
            this.errorCrearComunidad =
                'Debes ingresar el nombre de la comunidad.';
            return;
        }

        if (
            !this.nuevaComunidad.ubi_comu.trim()
        ) {
            this.errorCrearComunidad =
                'Debes ingresar la ubicación de la comunidad.';
            return;
        }

        const existe =
            this.comunidades.some(
                comunidad =>
                    Number(comunidad.id_comunidades) ===
                    Number(this.nuevaComunidad.id_comunidades)
            );

        if (existe) {
            this.errorCrearComunidad =
                'Ya existe una comunidad con ese ID.';
            return;
        }
        this.creandoComunidad = true;
        const datos = {
            id_comunidades:
                Number(
                    this.nuevaComunidad.id_comunidades
                ),
            nom_comu:
                this.nuevaComunidad.nom_comu.trim(),
            ubi_comu:
                this.nuevaComunidad.ubi_comu.trim()
        };

        this.communityService
            .createCommunity(datos)
            .subscribe({
                next: (comunidadCreada) => {
                    this.creandoComunidad = false;
                    this.modalCrearComunidad = false;
                    this.cargarComunidades();

                    this.generarPDF(
                        comunidadCreada
                    );

                },

                error: (error) => {
                    console.error(
                        'Error creando comunidad:',
                        error
                    );
                    this.creandoComunidad = false;
                    if (error?.status === 409) {
                        this.errorCrearComunidad =
                            'Ya existe una comunidad con ese ID.';
                        return;
                    }

                    this.errorCrearComunidad =
                        'No fue posible crear la comunidad.';
                }
            });
    }

    async generarPDF(comunidad: Community): Promise<void> {
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 18;
            const azul = '#10376A';
            const gris = '#667085';
            const grisClaro = '#F5F7FA';
            const borde = '#DCE2EA';

            const logo = await this.cargarImagen(
                '/images/logo.png'
            );

            /* =====================================================
   HEADER
====================================================== */

            const logoDimensions =
                await this.obtenerDimensionesImagen(
                    '/images/logo.png'
                );


            /* =====================================================
            LOGO
            ====================================================== */

            const logoWidth = 42;

            const logoHeight =
                logoWidth *
                (logoDimensions.height /
                    logoDimensions.width);


            /*
            * El logo queda a la izquierda
            * manteniendo sus proporciones reales.
            */

            const logoX = margin;

            const logoY = 17;

            pdf.addImage(
                logo,
                'PNG',
                logoX,
                logoY,
                logoWidth,
                logoHeight,
                undefined,
                'FAST'
            );


            /* =====================================================
            INFORMACIÓN AXARQUIA
            ====================================================== */

            const infoX =
                pageWidth - margin;

            let infoY = 19;


            /* =====================================================
            NOMBRE EMPRESA
            ====================================================== */

            pdf.setFont(
                'helvetica',
                'bold'
            );

            pdf.setFontSize(16);

            pdf.setTextColor(azul);

            pdf.text(
                'AXARQUIA',
                infoX,
                infoY,
                {
                    align: 'right'
                }
            );


            /* =====================================================
            TELÉFONOS
            ====================================================== */

            infoY += 7;

            pdf.setFont(
                'helvetica',
                'normal'
            );

            pdf.setFontSize(9);

            pdf.setTextColor(gris);

            pdf.text(
                '951 13 76 28',
                infoX,
                infoY,
                {
                    align: 'right'
                }
            );

            infoY += 5;

            pdf.text(
                '684 20 00 22',
                infoX,
                infoY,
                {
                    align: 'right'
                }
            );


            /* =====================================================
            CORREO
            ====================================================== */

            infoY += 6;

            pdf.setFontSize(8);

            pdf.text(
                'correo: axarquiamantenimientos@gmail.com',
                infoX,
                infoY,
                {
                    align: 'right'
                }
            );


            /* =====================================================
            LÍNEA INFERIOR DEL HEADER
            ====================================================== */

            pdf.setDrawColor(borde);
            pdf.setLineWidth(0.5);
            pdf.line(
                margin,
                56,
                pageWidth - margin,
                56
            );

            pdf.setTextColor(azul);
            pdf.setFont(
                'helvetica',
                'bold'
            );
            pdf.setFontSize(15);
            pdf.text(
                'INFORMACIÓN DE LA COMUNIDAD',
                pageWidth / 2,
                67,
                {
                    align: 'center'
                }
            );

            const cardX = margin;
            const cardY = 74;
            const cardWidth =
                pageWidth - (margin * 2);
            const cardHeight = 46;
            pdf.setFillColor(grisClaro);
            pdf.setDrawColor(borde);
            pdf.roundedRect(
                cardX,
                cardY,
                cardWidth,
                cardHeight,
                4,
                4,
                'FD'
            );

            pdf.setFont(
                'helvetica',
                'bold'
            );
            pdf.setFontSize(8);
            pdf.setTextColor(gris);
            pdf.text(
                'ID COMUNIDAD',
                cardX + 8,
                cardY + 11
            );
            pdf.setFontSize(13);
            pdf.setTextColor(azul);
            pdf.text(
                String(comunidad.id_comunidades),
                cardX + 8,
                cardY + 20
            );
            const columna2 =
                cardX + cardWidth * 0.34;
            pdf.setFontSize(8);
            pdf.setTextColor(gris);
            pdf.text(
                'NOMBRE DE LA COMUNIDAD',
                columna2,
                cardY + 11
            );
            pdf.setFontSize(12);
            pdf.setTextColor(azul);
            const nombre =
                comunidad.nom_comu || 'Sin nombre';
            pdf.text(
                nombre,
                columna2,
                cardY + 20,
                {
                    maxWidth: 75
                }
            );

            const columna3 =
                cardX + cardWidth * 0.67;
            pdf.setFontSize(8);
            pdf.setTextColor(gris);
            pdf.text(
                'UBICACIÓN',
                columna3,
                cardY + 11
            );
            pdf.setFontSize(11);
            pdf.setTextColor(azul);
            const ubicacion =
                comunidad.ubi_comu || 'Sin ubicación';
            pdf.text(
                ubicacion,
                columna3,
                cardY + 20,
                {
                    maxWidth: 55
                }
            );
            const qrAreaY = 132;
            const qrAreaHeight = 112;
            const qrAreaX = margin;
            const qrAreaWidth =
                pageWidth - (margin * 2);

            pdf.setFillColor('#FFFFFF');
            pdf.setDrawColor(borde);
            pdf.roundedRect(
                qrAreaX,
                qrAreaY,
                qrAreaWidth,
                qrAreaHeight,
                5,
                5,
                'FD'
            );

            pdf.setTextColor(azul);
            pdf.setFont(
                'helvetica',
                'bold'
            );
            pdf.setFontSize(13);
            pdf.text(
                'CÓDIGO QR DE LA COMUNIDAD',
                pageWidth / 2,
                qrAreaY + 14,
                {
                    align: 'center'
                }
            );
            pdf.setFont(
                'helvetica',
                'normal'
            );
            pdf.setFontSize(8);
            pdf.setTextColor(gris);
            pdf.text(
                'Escanea este código para identificar la comunidad',
                pageWidth / 2,
                qrAreaY + 21,
                {
                    align: 'center'
                }
            );

            const QRCode =
                await import('qrcode');
            const qrData =
                String(comunidad.id_comunidades);
            const qrDataUrl =
                await QRCode.toDataURL(
                    qrData,
                    {
                        errorCorrectionLevel: 'H',
                        margin: 2,
                        width: 700
                    }
                );

            const qrSize = 72;
            const qrX =
                (pageWidth - qrSize) / 2;
            const qrY =
                qrAreaY + 31;
            pdf.addImage(
                qrDataUrl,
                'PNG',
                qrX,
                qrY,
                qrSize,
                qrSize,
                undefined,
                'FAST'
            );

            const logoQrSize = 15;
            const logoQrX =
                pageWidth / 2 -
                (logoQrSize / 2);
            const logoQrY =
                qrY +
                (qrSize / 2) -
                (logoQrSize / 2);
            pdf.setFillColor('#FFFFFF');
            pdf.roundedRect(
                logoQrX - 1.5,
                logoQrY - 1.5,
                logoQrSize + 3,
                logoQrSize + 3,
                2,
                2,
                'F'
            );
            pdf.addImage(
                logo,
                'PNG',
                logoQrX,
                logoQrY,
                logoQrSize,
                logoQrSize,
                undefined,
                'FAST'
            );
            pdf.setFont(
                'helvetica',
                'bold'
            );
            pdf.setFontSize(10);
            pdf.setTextColor(azul);
          
            const footerY =
                pageHeight - 18;
            pdf.setDrawColor(borde);
            pdf.setLineWidth(0.4);
            pdf.line(
                margin,
                footerY - 7,
                pageWidth - margin,
                footerY - 7
            );
            pdf.setFont(
                'helvetica',
                'normal'
            );
            pdf.setFontSize(8);
            pdf.setTextColor(gris);
            pdf.text(
                'Axarquia',
                pageWidth / 2,
                footerY,
                {
                    align: 'center'
                }
            );
            pdf.setFontSize(7);
            pdf.text(
                'Código de identificación de comunidad',
                pageWidth / 2,
                footerY + 5,
                {
                    align: 'center'
                }
            );

            pdf.save(
                `QR-Comunidad-${comunidad.id_comunidades}.pdf`
            );

        } catch (error) {
            console.error(
                'Error generando PDF:',
                error
            );
        }
    }
    private cargarImagen(
        src: string
    ): Promise<string> {

        return new Promise(
            (resolve, reject) => {

                const img =
                    new Image();

                img.onload = () => {

                    const canvas =
                        document.createElement('canvas');

                    canvas.width =
                        img.naturalWidth;

                    canvas.height =
                        img.naturalHeight;

                    const ctx =
                        canvas.getContext('2d');

                    if (!ctx) {

                        reject(
                            new Error(
                                'No se pudo crear el contexto del canvas'
                            )
                        );

                        return;
                    }

                    ctx.drawImage(
                        img,
                        0,
                        0
                    );

                    resolve(
                        canvas.toDataURL(
                            'image/png'
                        )
                    );

                };

                img.onerror = () => {
                    reject(
                        new Error(
                            `No se pudo cargar la imagen: ${src}`
                        )
                    );

                };
                img.src = src;
            }
        );
    }

    private truncarTexto(
        texto: string,
        maxCaracteres: number
    ): string {

        if (
            texto.length <= maxCaracteres
        ) {

            return texto;

        }

        return (
            texto.substring(
                0,
                maxCaracteres - 3
            ) + '...'
        );

    }

    private obtenerDimensionesImagen(
        src: string
    ): Promise<{
        width: number;
        height: number;
    }> {

        return new Promise(
            (resolve, reject) => {

                const img = new Image();

                img.onload = () => {

                    resolve({
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    });

                };

                img.onerror = () => {

                    reject(
                        new Error(
                            `No se pudo obtener las dimensiones de ${src}`
                        )
                    );

                };

                img.src = src;

            }
        );

    }

}