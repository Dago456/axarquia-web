import { Injectable } from '@angular/core';
import { Report } from '../features/reports/models/report.models';

export interface ReportDraft {
    id: string;
    report: Report;
    estado: 'BORRADOR' | 'PENDIENTE_ENVIO' | 'ENVIANDO' | 'ENVIADO';
    creadoEn: string;
    actualizadoEn: string;
}

@Injectable({
    providedIn: 'root'
})
export class IndexedDbService {

    private readonly DB_NAME = 'axarquia_web_db';
    private readonly DB_VERSION = 1;
    private readonly STORE_NAME = 'partes';

    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.abrirBaseDatos();
    }

    private abrirBaseDatos(): Promise<IDBDatabase> {

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(
                this.DB_NAME,
                this.DB_VERSION
            );

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = () => {

                const db = request.result;

                if (!db.objectStoreNames.contains(this.STORE_NAME)) {

                    const store = db.createObjectStore(
                        this.STORE_NAME,
                        {
                            keyPath: 'id'
                        }
                    );

                    store.createIndex(
                        'estado',
                        'estado',
                        { unique: false }
                    );

                    store.createIndex(
                        'actualizadoEn',
                        'actualizadoEn',
                        { unique: false }
                    );
                }
            };

        });

    }

    async guardarParte(
        report: Report,
        id?: string,
        estado:
            | 'BORRADOR'
            | 'PENDIENTE_ENVIO'
            | 'ENVIANDO'
            | 'ENVIADO' = 'BORRADOR'
    ): Promise<string> {

        const db = await this.dbPromise;

        const ahora = new Date().toISOString();

        const idParte = id ?? crypto.randomUUID();

        let creadoEn = ahora;

        if (id) {

            const existente =
                await this.obtenerParte(id);

            if (existente) {
                creadoEn = existente.creadoEn;
            }
        }

        const parte: ReportDraft = {

            id: idParte,

            report: structuredClone(report),

            estado,

            creadoEn,

            actualizadoEn: ahora

        };

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.STORE_NAME,
                'readwrite'
            );

            const store = transaction.objectStore(
                this.STORE_NAME
            );

            const request = store.put(parte);

            request.onsuccess = () => {
                resolve(idParte);
            };

            request.onerror = () => {
                reject(request.error);
            };

        });
    }

    async obtenerParte(id: string): Promise<ReportDraft | undefined> {

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.STORE_NAME,
                'readonly'
            );

            const store = transaction.objectStore(
                this.STORE_NAME
            );

            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };

        });
    }

    async obtenerPartesPendientes(): Promise<ReportDraft[]> {

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.STORE_NAME,
                'readonly'
            );

            const store = transaction.objectStore(
                this.STORE_NAME
            );

            const index = store.index('estado');

            const request = index.getAll(
                'PENDIENTE_ENVIO'
            );

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };

        });
    }

    async obtenerBorradores(): Promise<ReportDraft[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                this.STORE_NAME,
                'readonly'
            );
            const store =
                transaction.objectStore(
                    this.STORE_NAME
                );
            const index =
                store.index('estado');
            const request =
                index.getAll('BORRADOR');
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async obtenerPartesEnProceso(): Promise<ReportDraft[]> {

        const db = await this.dbPromise;
    
        return new Promise((resolve, reject) => {
    
            const transaction = db.transaction(
                this.STORE_NAME,
                'readonly'
            );
    
            const store = transaction.objectStore(
                this.STORE_NAME
            );
    
            const request = store.getAll();
    
            request.onsuccess = () => {
    
                const partes = request.result as ReportDraft[];
    
                resolve(
                    partes.filter(
                        parte =>
                            parte.estado === 'BORRADOR' ||
                            parte.estado === 'PENDIENTE_ENVIO' ||
                            parte.estado === 'ENVIANDO'
                    )
                );
    
            };
    
            request.onerror = () => {
                reject(request.error);
            };
    
        });
    }
    
    async eliminarParte(id: string): Promise<void> {

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {

            const transaction = db.transaction(
                this.STORE_NAME,
                'readwrite'
            );

            const store = transaction.objectStore(
                this.STORE_NAME
            );

            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };

        });
    }
}