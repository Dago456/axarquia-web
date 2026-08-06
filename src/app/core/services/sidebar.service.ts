import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  abierto = signal(false);

  abrir() {
    this.abierto.set(true);
  }

  cerrar() {
    this.abierto.set(false);
  }

  toggle() {
    this.abierto.update(v => !v);
  }

}