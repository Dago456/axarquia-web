import { Injectable } from '@angular/core';

declare global {

    interface Window{

        _env:any;

    }

}

@Injectable({
    providedIn:'root'
})
export class EnvService{

    get ENDPOINT_PRIMARY():string{

        return window._env.ENDPOINT_PRIMARY;

    }

}