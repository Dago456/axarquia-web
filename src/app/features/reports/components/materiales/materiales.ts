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

  material = '';

  agregarMaterial(): void {

    const nuevoMaterial = this.material.trim();

    if (!nuevoMaterial) {
      return;
    }

    this.materiales.push(nuevoMaterial);

    this.material = '';

  }

  eliminarMaterial(index: number): void {

    this.materiales.splice(index, 1);

  }

}