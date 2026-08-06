import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class ModalComponent {

  @Input()
  visible = false;

  @Input()
  titulo = '';

  @Output()
  cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

}