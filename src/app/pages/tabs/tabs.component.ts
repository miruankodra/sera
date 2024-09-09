import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {Tabs} from "../../models/constants/tabs";
import {TabsService} from "../../services/tabs.service";
import {Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'se-tabs',
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent implements OnInit {

  private _tabsService: TabsService = inject(TabsService);
  activeTab$: Observable<string> = this._tabsService.activeTab$;
  protected readonly Tabs = Tabs;

  ngOnInit(): void {
    this._tabsService.changeActiveTab('Kreu');
  }

  activateTab(tab: string): void {
    this._tabsService.changeActiveTab(tab)
  }

}
