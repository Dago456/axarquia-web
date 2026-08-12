import { Injectable } from '@angular/core';

export interface OperarioSesion {
  id_Operario: number;
  nom_ope: string;
  estado_ope: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly CLAVE_SESION = 'operario';

  guardarSesion(operario: OperarioSesion): void {

    localStorage.setItem(
      this.CLAVE_SESION,
      JSON.stringify(operario)
    );

    console.log(
      '🔐 Sesión guardada:',
      operario
    );
  }

  obtenerSesion(): OperarioSesion | null {

    const datos =
      localStorage.getItem(
        this.CLAVE_SESION
      );

    if (!datos) {
      return null;
    }

    try {

      return JSON.parse(datos);

    } catch (error) {

      console.error(
        '❌ Error leyendo sesión:',
        error
      );

      this.cerrarSesion();

      return null;
    }
  }

  obtenerOperario(): OperarioSesion | null {
    return this.obtenerSesion();
  }

  estaAutenticado(): boolean {
    return this.obtenerSesion() !== null;
  }

  cerrarSesion(): void {

    localStorage.removeItem(
      this.CLAVE_SESION
    );

    console.log(
      '👋 Sesión cerrada'
    );
  }

}