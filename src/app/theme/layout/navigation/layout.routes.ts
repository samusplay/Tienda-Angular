import { Routes } from '@angular/router';
import { Cliente } from '../../../pages/cliente/cliente';
import { Empleados } from '../../../pages/empleado/empleados';
import { Inicio } from '../../../pages/inicio/inicio';
import { Inventario } from '../../../pages/inventario/inventario';
import { Productos } from '../../../pages/productos/productos';
import { Sucursal } from '../../../pages/sucursal/sucursal';
import { Ventas } from '../../../pages/ventas/ventas';

//Rutas Hijas
export const layoutRoutes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'sucursal', component: Sucursal },
  { path: 'empleado', component: Empleados },
  { path: 'ventas', component: Ventas },
  { path: 'cliente', component: Cliente },
  { path: 'productos', component: Productos },
  { path: 'inventario', component:Inventario },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];