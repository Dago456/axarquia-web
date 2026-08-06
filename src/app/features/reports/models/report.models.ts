export interface Report {

    idComunidad:number;

    nombreComunidad:string;

    ubicacionComunidad:string;

    motivoVisita:string;

    conceptoTrabajo:string;

    observaciones:string;

    horaEntrada:string;

    operario:number|null;

    contacto:string;

    materiales:string[];

    conceptoCobro:string;

    valorCobro:number|null;

    fotos:File[];

    firma:string|null;

}