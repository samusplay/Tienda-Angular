// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sucursales',
    loadChildren: () =>
      import('./features/sucursales/routes').then(m => m.SUCURSAL_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'sucursales' },
];
