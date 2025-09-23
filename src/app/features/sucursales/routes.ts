// features/sucursales/routes.ts
import { Routes } from '@angular/router';
import { SucursalList } from './ui/sucursal-list/sucursal-list';

//exportamos Rutas hijas
export const SUCURSAL_ROUTES: Routes = [
  { path: '', component: SucursalList }, // /sucursales
];

