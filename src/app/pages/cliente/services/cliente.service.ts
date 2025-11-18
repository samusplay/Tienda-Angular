import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroment';
import { BackendService } from '../../../../services/backend.service';
import { Observable } from 'rxjs';
import { ClienteRs } from '../model/clienteRs';
import { ClienteRq } from '../model/clienteRq';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl=environment.apiUrl
  private endpoint='cliente'

  constructor(private readonly  backend:BackendService){}

  //funcionalidades desde el backend

  //Lista todos los clientes
 ListarClientes(): Observable<ClienteRs[]> {
  return this.backend.get<ClienteRs[]>(`${this.endpoint}/listar`)  
  }

  //Guardar cliente
  GuardarCliente(cliente:ClienteRq): Observable<ClienteRs>{
  return this.backend.post<ClienteRs>(`${this.endpoint}/crear`,cliente)
   }

   //actualizar cliente con post
   ActualizarCliente(idCliente: number, cliente:ClienteRq): Observable<ClienteRs>{
    return this.backend.post<ClienteRs>(`${this.endpoint}/actualizar/${idCliente}`,cliente)
   }

   //FALTA EL DELETE

  
}
