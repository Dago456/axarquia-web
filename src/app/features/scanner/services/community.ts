import { Injectable } from '@angular/core';
import { Community } from '../models/community.model';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private communities: Community[] = [

    {
      id: 1,
      nombre: 'Conjunto Primavera',
      direccion: 'Cra 15 #120-10',
      ciudad: 'Bogotá',
      codigoQr: 'QR001'
    },
    {
      id: 2,
      nombre: 'Conjunto Imperial',
      direccion: 'Calle 80 #50-20',
      ciudad: 'Bogotá',
      codigoQr: 'QR002'
    },
    {
      id: 3,
      nombre: 'Parques del Norte',
      direccion: 'Av. Boyacá #140',
      ciudad: 'Bogotá',
      codigoQr: 'QR003'
    }

  ];

  getAll(): Community[] {
    return this.communities;
  }

  search(text: string): Community[] {

    const filtro = text.trim().toLowerCase();

    if (!filtro) {
      return [];
    }

    return this.communities.filter(c =>
      c.nombre.toLowerCase().includes(filtro) ||
      c.id.toString().includes(filtro)
    );

  }

}