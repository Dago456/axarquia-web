import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../../../core/services/env.service';

export interface Operario {
  id_Operario: number;
  nom_ope: string;
  estado_ope: number;
}

export interface CrearOperario {
  nom_ope: string;
  password: string;
  estado_ope: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private endpoint: string;

  constructor(
    private http: HttpClient,
    private envService: EnvService
  ) {
    this.endpoint = this.envService.ENDPOINT_PRIMARY;
  }

  obtenerUsuarios(): Observable<Operario[]> {
    return this.http.get<Operario[]>(
      `${this.endpoint}/operario`
    );
  }

  obtenerUsuarioPorId(id: number): Observable<Operario> {
    return this.http.get<Operario>(
      `${this.endpoint}/operario/${id}`
    );
  }

  crearUsuario(usuario: CrearOperario): Observable<any> {
    return this.http.post(
      `${this.endpoint}/operario`,
      usuario
    );
  }

  actualizarUsuario(
    id: number,
    usuario: Partial<CrearOperario>
  ): Observable<any> {
    return this.http.put(
      `${this.endpoint}/operario/${id}`,
      usuario
    );
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(
      `${this.endpoint}/operario/${id}`
    );
  }
}