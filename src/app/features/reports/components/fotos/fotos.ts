import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fotos',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './fotos.html',
  styleUrl: './fotos.scss'
})
export class FotosComponent {

  @Input()
  fotos: File[] = [];

  @Output()
  fotosChange = new EventEmitter<File[]>();


  seleccionarFotos(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const nuevasFotos = Array.from(input.files);

    this.fotos.push(...nuevasFotos);

    this.fotosChange.emit(this.fotos);

    // Permite volver a seleccionar el mismo archivo
    input.value = '';
  }


  eliminarFoto(index: number): void {

    this.fotos.splice(index, 1);

    this.fotosChange.emit(this.fotos);
  }


  obtenerPreview(foto: File): string {

    return URL.createObjectURL(foto);
  }

}