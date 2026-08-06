import { Component } from '@angular/core';

import { QrReaderComponent } from '../../components/qr-reader/qr-reader';
import { SearchCommunityComponent } from '../../components/search-community/search-community';
import { CommunityListComponent } from '../../components/community-list/community-list';

import { Community } from '../../models/community.model';

import { CommunityService } from '../../../../core/services/comunidadservice/comunidad.service';
import { NgIf } from '@angular/common';
import { ModalComponent } from "../../../../shared/components/modal/modal";

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    QrReaderComponent,
    SearchCommunityComponent,
    CommunityListComponent,
    NgIf,
    ModalComponent
],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss'
})
export class ScannerComponent {

  communities: Community[] = [];
  cargando = false;

  constructor(
    private communityService: CommunityService
  ) { }

  mostrarScanner = false;

abrirScanner(){

    this.mostrarScanner = true;

}

cerrarScanner(){

    this.mostrarScanner = false;

}

codigoDetectado(codigo:string){

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

}