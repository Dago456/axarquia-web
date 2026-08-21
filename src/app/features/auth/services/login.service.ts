import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../../../core/services/env.service';


export interface LoginResponse {
  success: boolean;
  message?: string;

  operario?: {
    id_Operario: number;
    nom_ope: string;
    estado_ope: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private env = inject(EnvService);

  login(
    id_Operario: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.env.ENDPOINT_PRIMARY}/operario/login`,
      {
        id_Operario,
        password
      }
    );

  }

}