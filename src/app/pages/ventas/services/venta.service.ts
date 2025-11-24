import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroment';
import { BackendService } from '../../../../services/backend.service';
import { Observable } from 'rxjs';
import { VentaRs } from '../model/ventaRs';
import { VentaRq } from '../model/ventaRq';
import { VentaActualizarRq } from '../model/ventaActualizarRq';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = environment.apiUrl
  private endpoint ='venta'

  constructor(private readonly backend:BackendService){}

  //listar funcionalidades
  ListarVentas(): Observable<VentaRs[]> {
    return this.backend.get<VentaRs[]>(`${this.endpoint}/listar`);
  }

  CrearVenta(body: VentaRq): Observable<VentaRs> {
    return this.backend.post<VentaRs>(`${this.endpoint}/crear`, body);
  }

   ActualizarVenta(idVenta: number, body: VentaActualizarRq): Observable<VentaRs> {
    return this.backend.post<VentaRs>(`${this.endpoint}/actualizar/${idVenta}`, body);
  }

}
