import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { BackendService } from '../../../../services/backend.service';
import { InventarioActualizarRq } from '../model/inventario-actualizar-rq';
import { InventarioRq } from '../model/inventario-rq';
import { InventarioRs } from '../model/inventario-rs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  /** Debe coincidir con el @RequestMapping del backend */
  private endpoint = 'inventario';      // o 'api/inventario' si en el backend dejaste /api/inventario

  constructor(private readonly backend: BackendService) {}

  // ===== LISTAR =====
  ListarInventario(idSucursal?: number): Observable<InventarioRs[]> {
    const path = `${this.endpoint}/listar`;
    const params = idSucursal != null ? { idSucursal } : undefined;
    return this.backend.get<InventarioRs[]>(path, params);
  }

  // ===== CREAR =====
  CrearInventario(body: InventarioRq): Observable<InventarioRs> {
    const path = `${this.endpoint}/crear`;
    return this.backend.post<InventarioRs>(path, body);
  }

  // ===== ACTUALIZAR =====
  ActualizarInventario(body: InventarioActualizarRq): Observable<InventarioRs> {
    const path = `${this.endpoint}/actualizar`;
    // en backend tienes @PostMapping("/actualizar"), así que POST está bien
    return this.backend.post<InventarioRs>(path, body);
  }
}
