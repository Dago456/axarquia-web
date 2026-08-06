import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Community } from '../../models/community.model';

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-list.html',
  styleUrl: './community-list.scss'
})
export class CommunityListComponent {

  @Input()
  communities: Community[] = [];

  @Output()
  seleccionar = new EventEmitter<Community>();

  seleccionarComunidad(comunidad: Community){

    this.seleccionar.emit(comunidad);

  }

}