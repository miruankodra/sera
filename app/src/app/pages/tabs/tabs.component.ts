import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {Tabs} from "../../models/constants/tabs";
import {TabsService} from "../../services/tabs.service";
import {Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {NavigationService} from "../../services/navigation.service";
import {TabDto} from "../../models/tab-dto";
import { AnimateOnClickDirective } from '../../directives/animateOnClick.directive';
import {PushNotificationService} from '../../services/push-notification.service';

@Component({
  selector: 'se-tabs',
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,
    AnimateOnClickDirective
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent implements OnInit {

  private _tabsService: TabsService = inject(TabsService);
  private _navigation: NavigationService = inject(NavigationService);
  private _pushNotifications: PushNotificationService = inject(PushNotificationService);
  activeTab$: Observable<string> = this._tabsService.activeTab$;
  protected readonly Tabs = Tabs;

  ngOnInit(): void {
    this._tabsService.changeActiveTab('Home');
    this._pushNotifications.initialize();
  }

  goToTab(tab: TabDto): void {
    this._navigation.navigateTo(tab.path);
    this._tabsService.changeActiveTab(tab.label)
  }

}
