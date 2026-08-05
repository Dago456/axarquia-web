import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-community',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-community.html',
  styleUrl: './search-community.scss'
})
export class SearchCommunityComponent {

  @Output()
  buscar = new EventEmitter<string>();

  texto = '';

  onInput(): void {
    this.buscar.emit(this.texto);
  }

}