// app.routes.ts
import { Routes } from '@angular/router';
//Componente llamado Layout
import { Layout } from './theme/layout/layout';
import { layoutRoutes } from './theme/layout/navigation/layout.routes';
//Manjearremos las Sub Rutas de los componentes
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: layoutRoutes
  }

]
