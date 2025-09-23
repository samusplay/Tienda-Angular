import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { sucursal } from '../../data/sucursal.model';
import { SucursalService } from '../../data/sucursal.service';


//Maneja la logica
@Component({
  //Nombre que vamos usar en la etiqueta
  selector: 'app-sucursal-list',
  standalone:true,
  imports: [CommonModule],
  //el HTML que se va renderizar
  templateUrl: './sucursal-list.html',
  //el sccs que se va estilizar
  styleUrl: './sucursal-list.scss'
})
//lo que va controlar la logica
export class SucursalList implements OnInit{
  //variables de clase
  sucursales:sucursal[]=[];
  cargando=true;
  error: string| null=null;
  trackId = (_: number, s: sucursal) => s.id;


  //Inyectamos constructor del servicio 

  constructor( private sucursalService: SucursalService){}
  
    //lo ejeucta una vez  y carga el sevricio definir que no se quede en estado de carga

  ngOnInit(): void {
  this.cargando = true;

  this.sucursalService.listar(true).subscribe({
    next: (data) => {
      console.log('sucursales:', data);          // debug opcional
      this.sucursales = data;
      this.cargando = false;                     
    },
    error: (err) => {
      console.error('Error cargando sucursales', err);
      this.error = 'No se pudo cargar';           
    }
  });
}

}
