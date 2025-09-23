import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { sucursal } from './sucursal.model';
@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  
  private readonly base='http://localhost:8080/sucursal/listar';

  //inyectamos el servicio

  constructor(private http: HttpClient){}

  //Crear metodo  de la clase SucursalService luego lo vamos usar en el componente
  // Va devolver un array del backend
  listar(soloActivas:boolean=true):Observable<sucursal[]>{
    return this.http.get<sucursal[]>(`${this.base}?soloActivas=${soloActivas}`);
  }

  
}
