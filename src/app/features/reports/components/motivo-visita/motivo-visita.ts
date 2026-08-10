import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-motivo-visita',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './motivo-visita.html',
  styleUrl: './motivo-visita.scss'
})
export class MotivoVisitaComponent {

  @Input()
  motivo: string = '';

  @Output()
  motivoChange = new EventEmitter<string>();

  opciones: string[] = [
    'Revisión',
    'Cobro',
    'Pintura',
    'Brillo',
    'Limpieza de aljibe',
    'Limpieza mensual',
    'Limpieza diaria',
    'Avería'
  ];

  cambiarMotivo(): void {

    this.motivoChange.emit(this.motivo);

  }

}