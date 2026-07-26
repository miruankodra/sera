import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/authentication/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then(m => m.TabsRoutes)
  }
];
