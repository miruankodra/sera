import {Routes} from "@angular/router";
import {TabsComponent} from "./tabs.component";

export const TabsRoutes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../home/home.component').then(m => m.HomeComponent)
      }
    ]
  }
];
