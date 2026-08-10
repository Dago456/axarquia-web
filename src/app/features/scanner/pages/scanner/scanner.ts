import { Component } from '@angular/core';

import { QrReaderComponent } from '../../components/qr-reader/qr-reader';
import { SearchCommunityComponent } from '../../components/search-community/search-community';
import { CommunityListComponent } from '../../components/community-list/community-list';

import { Community } from '../../models/community.model';

import { CommunityService } from '../../../../core/services/comunidadservice/comunidad.service';
import { NgIf } from '@angular/common';
import { ModalComponent } from "../../../../shared/components/modal/modal";
import { Router } from '@angular/router';
import { ReportService } from '../../../reports/services/report.service';

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
export class ScannerComponent {
  selectedCommunity?: Community;
  communities: Community[] = [];
  cargando = false;
  mostrarModalComunidad = false;

  constructor(
    private communityService: CommunityService,
    private router: Router,
    private reportService: ReportService
  ) { }

  mostrarScanner = false;


  seleccionarComunidad(community: Community) {
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