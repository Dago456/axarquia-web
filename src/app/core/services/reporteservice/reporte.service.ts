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
  
    // createReport(data: CreateReportRequest) {

    //     return this.http.post(
    
    //         `${this.env.ENDPOINT_PRIMARY}/reporte`,
    
    //         data
    
    //     );
    
    // }
  
  }