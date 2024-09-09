import {RoutePaths} from "./route-paths";
import {TabDto} from "../tab-dto";

export const Tabs: TabDto[] = [
  {
    iconActive: 'assets/images/icons/home.svg',
    iconInactive: 'assets/images/icons/home-outline.svg',
    label: 'Kreu',
    path: RoutePaths.home
  },
  {
    iconActive: 'assets/images/icons/clipboard.svg',
    iconInactive: 'assets/images/icons/clipboard-outline.svg',
    label: 'Raporte',
    path: RoutePaths.reports
  },
  {
    iconActive: 'assets/images/icons/calendar.svg',
    iconInactive: 'assets/images/icons/calendar-outline.svg',
    label: 'Kalendari',
    path: RoutePaths.calendar
  },
  {
    iconActive: 'assets/images/icons/person.svg',
    iconInactive: 'assets/images/icons/person-outline.svg',
    label: 'Profili',
    path: RoutePaths.profile
  },
]
