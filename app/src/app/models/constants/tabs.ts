import {RoutePaths} from "./route-paths";
import {TabDto} from "../tab-dto";

export const Tabs: TabDto[] = [
  {
    iconActive: 'assets/images/icons/home.svg',
    iconInactive: 'assets/images/icons/home-outline.svg',
    label: 'Home',
    path: RoutePaths.home
  },
  {
    iconActive: 'assets/images/icons/calendar.svg',
    iconInactive: 'assets/images/icons/calendar-outline.svg',
    label: 'Calendar',
    path: RoutePaths.calendar
  },
  {
    iconActive: 'assets/images/icons/clipboard.svg',
    iconInactive: 'assets/images/icons/clipboard-outline.svg',
    label: 'Reports',
    path: RoutePaths.reports
  },
  {
    iconActive: 'assets/images/icons/person.svg',
    iconInactive: 'assets/images/icons/person-outline.svg',
    label: 'Profile',
    path: RoutePaths.profile
  },
]
