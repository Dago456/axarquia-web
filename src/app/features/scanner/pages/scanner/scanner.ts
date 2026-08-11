import { Component, OnInit } from '@angular/core';

import { QrReaderComponent } from '../../components/qr-reader/qr-reader';
import { SearchCommunityComponent } from '../../components/search-community/search-community';
import { CommunityListComponent } from '../../components/community-list/community-list';

import { Community } from '../../models/community.model';

import { CommunityService } from '../../../../core/services/comunidadservice/comunidad.service';
import { ModalComponent } from "../../../../shared/components/modal/modal";
import { Router } from '@angular/router';
import { ReportService } from '../../../reports/services/report.service';
import { IndexedDbService, ReportDraft } from '../../../../services/indexed-db.service';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    QrReaderComponent,
    SearchCommunityComponent,
    CommunityListComponent,
    ModalComponent
  ],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss'
})
export class ScannerComponent implements OnInit {
  selectedCommunity?: Community;
  communities: Community[] = [];
  cargando = false;
  mostrarModalComunidad = false;
  parteEnProceso?: ReportDraft;
  mostrarModalParte = false;
  constructor(
    private communityService: CommunityService,
    private router: Router,
    private reportService: ReportService,
    private indexedDbService: IndexedDbService,
  ) { }

  mostrarScanner = false;

  async ngOnInit(): Promise<void> {
    console.log('🔎 Buscando partes en proceso...');
    await this.buscarParteEnProceso();
  }
  async buscarParteEnProceso(): Promise<void> {
    try {
      const partes =
        await this.indexedDbService.obtenerPartesEnProceso();
      console.log(
        '📦 Partes encontrados:',
        partes
      );
      if (partes.length === 0) {
        console.log(
          '❌ No hay partes en proceso'
        );
        return;
      }
      partes.sort(
        (a, b) =>
          new Date(b.actualizadoEn).getTime() -
          new Date(a.actualizadoEn).getTime()
      );
      this.parteEnProceso = partes[0];
      console.log(
        '✅ Parte en proceso encontrado:',
        this.parteEnProceso
      );
      this.mostrarModalParte = true;
    } catch (error) {
      console.error(
        '❌ Error buscando partes en proceso:',
        error
      );
    }
  }

  async continuarParte(): Promise<void> {
    if (!this.parteEnProceso) {
      return;
    }

    const cargado =
      await this.reportService.cargarBorrador(
        this.parteEnProceso.id
      );

    if (!cargado) {
      console.error(
        'No se pudo cargar el parte'
      );
      return;
    }
    this.mostrarModalParte = false;
    await this.router.navigate(['/report']);
  }

  async descartarParte(): Promise<void> {
    if (!this.parteEnProceso) {
      return;
    }

    try {
      await this.indexedDbService.eliminarParte(
        this.parteEnProceso.id
      );
      this.parteEnProceso = undefined;
      this.mostrarModalParte = false;
      this.reportService.limpiar();
      console.log(
        '🗑️ Parte descartado'
      );

    } catch (error) {
      console.error(
        'Error descartando parte:',
        error
      );
    }
  }

  seleccionarComunidad(community: Community): void {

    this.reportService.nuevoParte();
    this.reportService.report.idComunidad =
      community.id_comunidades;
    this.reportService.report.nombreComunidad =
      community.nom_comu;
    this.reportService.report.ubicacionComunidad =
      community.ubi_comu;
    this.router.navigate(['/report']);

  }

  cerrarModalComunidad() {
    this.mostrarModalComunidad = false;
  }
  cerrarModalParte(): void {
    this.mostrarModalParte = false;
  }

  abrirScanner() {
    this.mostrarScanner = true;
  }

  cerrarScanner() {
    this.mostrarScanner = false;
  }

  codigoDetectado(codigo: string) {
    this.cerrarScanner();
    this.buscar(codigo);
  }

  buscar(texto: string): void {
    console.log("Buscar:", texto);
    if (!texto.trim()) {
      this.communities = [];
      return;
    }
    this.cargando = true;

    // Buscar por ID
    if (!isNaN(Number(texto))) {
      this.communityService.getCommunityById(Number(texto))
        .subscribe({
          next: (community) => {
            this.communities = [community];
            this.cargando = false;
            console.log(community)
          },

          error: () => {
            this.communities = [];
            this.cargando = false;
          }
        });
    }

    // Buscar por nombre
    else {
      this.communityService.searchCommunity(texto)
        .subscribe({
          next: (communities) => {
            this.communities = communities;
            this.cargando = false;
          },
          error: () => {
            this.communities = [];
            this.cargando = false;
          }
        });
    }
  }

  crearParte() {
    this.mostrarModalComunidad = false;
    this.router.navigate(
      ['/report'],
      {
        state: {
          community: this.selectedCommunity
        }
      }
    );
  }

}