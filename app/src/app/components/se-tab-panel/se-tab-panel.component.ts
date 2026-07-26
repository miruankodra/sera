import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { SeControlCardComponent } from "../se-control-card/se-control-card.component";
import { SePanelTabComponent } from '../se-panel-tab/se-panel-tab.component';

@Component({
  selector: 'se-tab-panel',
  standalone: true,
  templateUrl: './se-tab-panel.component.html',
  styleUrls: ['./se-tab-panel.component.scss'],
  imports: [SeControlCardComponent, SePanelTabComponent]
})
export class SeTabPanelComponent implements AfterContentInit{
  @ContentChildren(SePanelTabComponent) tabs!: QueryList<SePanelTabComponent>;

  ngAfterContentInit(): void {
    const activeTabs = this.tabs.filter(tab => tab.active);
    if (activeTabs.length === 0 && this.tabs.length > 0) {
      this.tabs.first.active = true;
    }
  }

  selectTab(tab: SePanelTabComponent): void {
    this.tabs.forEach(t => t.active = false);
    tab.active = true;
  }
}
