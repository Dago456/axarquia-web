import { Component } from '@angular/core';
import { Community } from '../../../scanner/models/community.model';

@Component({

    selector:'app-report',

    standalone:true,

    templateUrl:'./report.html',

    styleUrl:'./report.scss'

})

export class ReportComponent{

    community!: Community;

    ngOnInit(){

        this.community = history.state.community;

        console.log(this.community);

    }

}