import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroment';
import { BackendService } from '../../../../services/backend.service';
import { Observable } from 'rxjs';
import { EmpleadoRs } from '../model/empleadoRs';
import { EmpleadoRq } from '../model/empleadoRq';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl=environment.apiUrl
  private endpoint='empleado'
  
  constructor(private readonly backend:BackendService){}
  
  //Lista funcionalidades
  ListarEmpleados(): Observable<EmpleadoRs[]> {
    return this.backend.get<EmpleadoRs[]>(`${this.endpoint}/listar`);
  }

  CrearEmpleado(empleado: EmpleadoRq): Observable<EmpleadoRs> {
    return this.backend.post<EmpleadoRs>(`${this.endpoint}/crear`, empleado);
  }

  ActualizarEmpleado(id: number, empleado: EmpleadoRq): Observable<EmpleadoRs> {
    return this.backend.post<EmpleadoRs>(
      `${this.endpoint}/actualizar/${id}`,
      empleado
    );
  }

}
