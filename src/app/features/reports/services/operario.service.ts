import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Operario } from '../../../features/reports/models/operario.model';
import { EnvService } from '../../../core/services/env.service';

@Injectable({
  providedIn: 'root'
})
export class OperarioService {

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  buscarOperarios(texto: string) {
    return this.http.get<Operario[]>(
      `${this.env.ENDPOINT_PRIMARY}/operario/search/${texto}`
    );
  }

  getOperarioById(id: number): Observable<Operario> {

    return this.http.get<Operario>(

      `${this.env.ENDPOINT_PRIMARY}/operarios/${id}`

    );

  }

}