import { Component, inject } from '@angular/core';
import { AuthService, OperarioSesion } from '../../../features/auth/services/auth.service';



@Component({

  selector: 'app-header',

  standalone: true,

  imports: [],

  templateUrl: './header.html',

  styleUrl: './header.scss'

})
export class Header {

  private authService = inject(AuthService);

  operario: OperarioSesion | null =
    this.authService.obtenerOperario();

  get iniciales(): string {

    if (!this.operario?.nom_ope) {
      return 'OP';
    }

    const partes =
      this.operario.nom_ope
        .trim()
        .split(' ')
        .filter(nombre => nombre.length > 0);

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0][0] +
      partes[1][0]
    ).toUpperCase();
  }

  cerrarSesion(): void {

    this.authService.cerrarSesion();

    window.location.href = '/login';

  }

}