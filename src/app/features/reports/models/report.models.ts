export interface Reportold {

    idComunidad:number;
    nombreComunidad:string;
    ubicacionComunidad:string;
    motivoVisita:string;
    conceptoTrabajo:string;
    observaciones:string;
    horaEntrada:string;
    operario: number[];
    contacto:string;
    materiales:string[];
    conceptoCobro:string;
    valorCobro:number|null;
    fotos:File[];
    firma:string|null;
}

export interface Report {
    idComunidad: number;
    nombreComunidad: string;
    ubicacionComunidad: string;

    motivoVisita: string;
    contacto: string;

    conceptoTrabajo: string;
    observaciones: string;

    horaEntrada: string;
    horaFinalizacion: string;
    duracion: string;

    operario: string[];
    materiales: string[];

    fotos: File[];

    firma: string | null;

    firmaOperario: string | null;
}