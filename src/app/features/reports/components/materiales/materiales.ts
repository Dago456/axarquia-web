import { Component, Input } from '@angular/core';
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

  nuevoMaterial = '';

  agregarMaterial(): void {

    const material = this.nuevoMaterial.trim();

    if (!material) {
      return;
    }

    this.materiales.push(material);

    this.nuevoMaterial = '';
  }

  eliminarMaterial(index: number): void {

    this.materiales.splice(index, 1);

  }

}