import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'test',
    loadComponent: () => import('./pages/test/test.component').then(m => m.TestComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/authentication/login/login.component').then(m => m.LoginComponent)
  }
];
