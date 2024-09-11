import {Routes} from "@angular/router";
import {TabsComponent} from "./tabs.component";
import {RoutePaths} from "../../models/constants/route-paths";

export const TabsRoutes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: RoutePaths.home,
        loadComponent: () => import('../home/home.component').then(m => m.HomeComponent)
      },
      {
        path: RoutePaths.reports,
        loadComponent: () => import('../reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: RoutePaths.calendar,
        loadComponent: () => import('../calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: RoutePaths.profile,
        loadComponent: () => import('../profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: RoutePaths.home,
        pathMatch: 'full'
      }
    ]
  }
];
