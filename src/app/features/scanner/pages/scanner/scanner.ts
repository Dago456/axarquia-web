import { Component } from '@angular/core';

import { QrReader } from '../../components/qr-reader/qr-reader';
import { SearchCommunityComponent } from '../../components/search-community/search-community';
import { CommunityListComponent } from '../../components/community-list/community-list';

import { Community } from '../../models/community.model';
import { CommunityService } from '../../services/community';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    QrReader,
    SearchCommunityComponent,
    CommunityListComponent
  ],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss'
})
export class ScannerComponent {

  communities: Community[] = [];

  constructor(
    private communityService: CommunityService
) {}

  buscar(texto: string): void {
    this.communities = this.communityService.search(texto);
  }

}