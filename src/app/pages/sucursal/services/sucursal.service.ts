import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroment';
import { BackendService } from '../../../../services/backend.service';
import { SucursalRs } from '../model/sucursalRs';
import { Observable } from 'rxjs';
import { SucursalRq } from '../model/sucursalRq';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private apiUrl=environment.apiUrl
    private endpoint='sucursal'

    constructor(private readonly backend:BackendService){}

    //Listar Sucursales
    ListarSucursales(): Observable<SucursalRs[]> {
      return this.backend.get<SucursalRs[]>(`${this.endpoint}/listar`)  
      }
    //crear Sucursal
    CrearSucursal(sucursal:SucursalRq): Observable<SucursalRs>{
      return this.backend.post<SucursalRs>(`${this.endpoint}/crear`,sucursal)
    }
    //Actualizar Sucursal
    ActualizarSucursal(id: number, sucursal: SucursalRq): Observable<SucursalRs> {
    return this.backend.post<SucursalRs>(`${this.endpoint}/actualizar/${id}`, sucursal);
   }
}
