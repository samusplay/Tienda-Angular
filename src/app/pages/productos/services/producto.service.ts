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
     // Listar productos  -> GET /producto/listar
    ListarProductos(): Observable<ProductoRs[]> {
    return this.backend.get<ProductoRs[]>(`${this.endpoint}/listar`);
  }
    
    //CrearProducto
    crearProducto(producto:ProductoRq): Observable<ProductoRs>{
      return this.backend.post<ProductoRs>(`${this.endpoint}/crear`,producto)
    }
    
    // Actualizar producto -> POST /producto/actualizar/{idProducto}
    ActualizarProducto(id: number, producto: ProductoRq): Observable<ProductoRs> {
    return this.backend.post<ProductoRs>(`${this.endpoint}/actualizar/${id}`, producto);
    }


  
}
