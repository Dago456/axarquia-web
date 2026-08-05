import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class LoginComponent {
 
 
  constructor(
    private router: Router
  ) {

  }
  usuario = '';

  password = '';

  ocultarPassword = true;

  ingresar() {

    this.router.navigate(['/']);

  }

  buscarHistorial() {

    console.log('Buscar historial');

  }

}