import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './logind.scss'
})
export class LoginComponent {

  usuario = '';
  password = '';

  ocultarPassword = true;

  cargando = false;
  error = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private authService: AuthService
  ) { }

  ingresar(): void {

    this.error = '';

    if (!this.usuario.trim() || !this.password.trim()) {

      this.error =
        'Ingrese el usuario y la contraseña.';

      return;
    }

    this.cargando = true;

    console.log('🔐 Intentando iniciar sesión...');

    this.loginService.login(
      this.usuario.trim(),
      this.password
    ).subscribe({

      next: (respuesta) => {

        this.cargando = false;

        if (!respuesta.success || !respuesta.operario) {

          this.error =
            respuesta.message ||
            'Usuario o contraseña incorrectos.';

          return;
        }

        console.log(
          '✅ Login correcto:',
          respuesta.operario
        );

        /*
         * Por ahora solamente guardamos
         * los datos básicos del operario.
         *
         * Después crearemos un servicio de sesión
         * para manejar esto correctamente.
         */

        // localStorage.setItem(
        //   'operario',
        //   JSON.stringify(respuesta.operario)
        // );
        console.log(
          '✅ Login correcto:',
          respuesta.operario
        );

        this.authService.guardarSesion(
          respuesta.operario
        );

        this.router.navigate([
          '/dashboard'
        ]);

      },

      error: (error) => {

        this.cargando = false;

        console.error(
          '❌ Error durante el login:',
          error
        );

        this.error =
          error.error?.message ||
          'No fue posible conectar con el servidor.';

      }

    });
  }

  buscarHistorial(): void {

    console.log(
      'Buscar historial'
    );

  }

}