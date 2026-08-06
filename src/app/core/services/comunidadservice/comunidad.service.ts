import { HttpClient } from "@angular/common/http";
import { Community } from "../../../features/scanner/models/community.model";
import { EnvService } from "../env.service";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class CommunityService {
  
    private http = inject(HttpClient);
    private env = inject(EnvService);
  
    getAllCommunities() {
  
      return this.http.get<Community[]>(
  
        `${this.env.ENDPOINT_PRIMARY}/comunidad`
  
      );
  
    }
  
    searchCommunity(nombre: string) {
  
      return this.http.get<Community[]>(
  
        //`${this.env.ENDPOINT_PRIMARY}/comunidad/buscar?nombre=${nombre}`
        `https://dago.axarquiamalaga.com/comunidad/buscar?nombre=${nombre}`
  
      );
  
    }
  
    getCommunityById(id: number) {
  
      return this.http.get<Community>(
  
        `${this.env.ENDPOINT_PRIMARY}/comunidad/${id}`
  
      );
  
    }
  
  }