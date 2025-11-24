import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroment';
import { BackendService } from '../../../../services/backend.service';
import { ProductoRq } from '../model/productoRq';
import { Observable } from 'rxjs';
import { ProductoRs } from '../model/productoRs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl=environment.apiUrl
    private endpoint='producto'

    constructor(private readonly backend:BackendService){}

    //lista de funcionalidaes
    
    //CrearProducto
    crearProducto(producto:ProductoRq): Observable<ProductoRs>{
      return this.backend.post<ProductoRs>(`${this.endpoint}/crear`,producto)
    }


  
}
