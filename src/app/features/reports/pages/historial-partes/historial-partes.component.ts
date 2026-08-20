import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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


        const url =
            `${this.env.ENDPOINT_PRIMARY}/partes/comunidad/${idComunidad}`;


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
       DESCARGAR PDF (el que quedó guardado al crear el parte)
    ====================================================== */

    descargarPDF(parte: any): void {

        if (!parte.pdf_path) {

            alert(
                'Este parte no tiene un PDF guardado.'
            );

            return;

        }

        const url =
            `${this.env.ENDPOINT_PRIMARY}/partes/${parte.id_parte}/pdf`;

        this.http
            .get(url, { responseType: 'blob' })
            .subscribe({

                next: (blob) => {

                    const objectUrl =
                        URL.createObjectURL(blob);

                    const enlace =
                        document.createElement('a');

                    enlace.href = objectUrl;

                    enlace.download =
                        `parte-${parte.id_parte}.pdf`;

                    enlace.click();

                    URL.revokeObjectURL(objectUrl);

                },

                error: (error) => {

                    console.error(
                        'Error descargando el PDF:',
                        error
                    );

                    alert(
                        'No fue posible descargar el PDF de este parte.'
                    );

                }

            });

    }
}
