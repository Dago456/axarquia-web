import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './materiales.html',
  styleUrl: './materiales.scss'
})
export class MaterialesComponent {

  @Input()
  materiales: string[] = [];

  @Output()
  materialesChange = new EventEmitter<string[]>();

  nuevoMaterial = '';

  private readonly LONGITUD_MAXIMA = 100;

  agregarMaterial(): void {

    const material = this.nuevoMaterial
      .trim()
      .slice(0, this.LONGITUD_MAXIMA);

    if (!material) {
      return;
    }

    this.materiales.push(material);

    this.nuevoMaterial = '';

    this.materialesChange.emit(this.materiales);
  }

  eliminarMaterial(index: number): void {

    this.materiales.splice(index, 1);

    this.materialesChange.emit(this.materiales);
  }

}