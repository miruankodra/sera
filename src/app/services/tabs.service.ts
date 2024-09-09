import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  private activeTabSubject = new BehaviorSubject<string>('');
  activeTab$ = this.activeTabSubject.asObservable();

  public changeActiveTab(tab: string) {
    this.activeTabSubject.next(tab);
  }
}
