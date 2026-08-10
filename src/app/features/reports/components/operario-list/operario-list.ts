import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Operario } from '../../models/operario.model';

@Component({
  selector: 'app-operario-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './operario-list.html',
  styleUrl: './operario-list.scss'
})

export class OperarioListComponent {

  @Input()
  operarios: Operario[] = [];

  @Output()
  seleccionar = new EventEmitter<Operario>();

  seleccionarOperario(operario: Operario): void {

    this.seleccionar.emit(operario);

  }

}