import { Routes } from '@angular/router';
import { Inicio } from '../../../pages/inicio/inicio';
import { Sucursal } from '../../../pages/sucursal/sucursal';

//Rutas Hijas
export const layoutRoutes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'sucursal', component: Sucursal },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }
];