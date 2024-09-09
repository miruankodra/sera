import {inject, Injectable} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router: Router = inject(Router);

  public async navigateTo(path: string): Promise<boolean> {
    return await this.router.navigate([path]);
  }
}
