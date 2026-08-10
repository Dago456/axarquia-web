import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({

    selector:'app-search-operario',

    standalone:true,

    imports:[FormsModule],

    templateUrl:'./search-operario.html'

})

export class SearchOperarioComponent{

    texto='';

    @Output()

    buscarOperario=new EventEmitter<string>();

    buscar(){

        this.buscarOperario.emit(this.texto);

    }

}