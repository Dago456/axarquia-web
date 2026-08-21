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

  idOperario = '';
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

    if (!this.idOperario.trim() || !this.password.trim()) {

      this.error =
        'Ingrese el ID de operario y la contraseña.';

      return;
    }

    if (!/^\d+$/.test(this.idOperario.trim())) {

      this.error =
        'El ID de operario debe ser numérico.';

      return;
    }

    this.cargando = true;

    console.log('🔐 Intentando iniciar sesión...');

    this.loginService.login(
      this.idOperario.trim(),
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