import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Operario, UsersService } from '../../services/users.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from "../../../../shared/components/modal/modal";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent
],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {

  usuarios: Operario[] = [];
  cargando = false;
  error = '';
  modalCrear = false;

  nuevoUsuario = {
    nom_ope: '',
    password: '',
    estado_ope: 1
  };

  guardando = false;
  errorFormulario = '';

  modalEditar = false;

  usuarioEditando: Operario | null = null;

  datosEdicion = {
    nom_ope: '',
    password: '',
    estado_ope: 1
  };

  actualizando = false;
  errorEdicion = '';
  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {

    this.cargando = true;
    this.error = '';

    this.usersService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },

      error: (error) => {
        console.error('Error obteniendo usuarios:', error);
        this.error = 'No fue posible cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  abrirModalCrear(): void {

    console.log('ABRIENDO MODAL');
  
    this.nuevoUsuario = {
      nom_ope: '',
      password: '',
      estado_ope: 1
    };
  
    this.errorFormulario = '';
    this.modalCrear = true;
  
    console.log('modalCrear:', this.modalCrear);
  }

  abrirModalEditar(usuario: Operario): void {

    this.usuarioEditando = usuario;
  
    this.datosEdicion = {
      nom_ope: usuario.nom_ope,
      password: '',
      estado_ope: usuario.estado_ope
    };
  
    this.errorEdicion = '';
    this.modalEditar = true;
  }

  cerrarModalCrear(): void {
    if (this.guardando) {
      return;
    }

    this.modalCrear = false;
  }

  cerrarModalEditar(): void {

    if (this.actualizando) {
      return;
    }
  
    this.modalEditar = false;
    this.usuarioEditando = null;
  }

  crearUsuario(): void {

    this.errorFormulario = '';

    const nombre = this.nuevoUsuario.nom_ope.trim();
    const password = this.nuevoUsuario.password.trim();

    if (!nombre) {
      this.errorFormulario = 'El nombre de usuario es obligatorio.';
      return;
    }

    if (!password) {
      this.errorFormulario = 'La contraseña es obligatoria.';
      return;
    }

    this.guardando = true;

    this.usersService.crearUsuario({
      nom_ope: nombre,
      password: password,
      estado_ope: this.nuevoUsuario.estado_ope
    }).subscribe({

      next: () => {

        this.guardando = false;
        this.modalCrear = false;

        this.cargarUsuarios();
      },

      error: (error) => {

        console.error('Error creando usuario:', error);

        this.guardando = false;

        this.errorFormulario =
          error?.error?.message ||
          'No fue posible crear el usuario.';
      }

    });
  }
  guardarEdicion(): void {

    if (!this.usuarioEditando) {
      return;
    }
  
    this.errorEdicion = '';
  
    const nombre = this.datosEdicion.nom_ope.trim();
  
    if (!nombre) {
      this.errorEdicion = 'El nombre de usuario es obligatorio.';
      return;
    }
  
    this.actualizando = true;
  
    const datos: any = {
      nom_ope: nombre,
      estado_ope: this.datosEdicion.estado_ope
    };
  
    /*
     * Solo enviamos contraseña si el administrador
     * realmente escribió una nueva.
     */
    if (this.datosEdicion.password.trim()) {
      datos.password = this.datosEdicion.password.trim();
    }
  
    this.usersService.actualizarUsuario(
      this.usuarioEditando.id_Operario,
      datos
    ).subscribe({
  
      next: () => {
  
        this.actualizando = false;
  
        this.modalEditar = false;
  
        this.usuarioEditando = null;
  
        this.cargarUsuarios();
      },
  
      error: (error) => {
  
        console.error('Error actualizando usuario:', error);
  
        this.actualizando = false;
  
        this.errorEdicion =
          error?.error?.message ||
          'No fue posible actualizar el usuario.';
      }
  
    });
  }

  activarDesactivar(usuario: Operario): void {

    const nuevoEstado =
      usuario.estado_ope === 1
        ? 0
        : 1;

    this.usersService.actualizarUsuario(
      usuario.id_Operario,
      {
        estado_ope: nuevoEstado
      }
    ).subscribe({
      next: () => {
        usuario.estado_ope = nuevoEstado;
      },

      error: (error) => {
        console.error('Error actualizando estado:', error);
      }
    });
  }
}