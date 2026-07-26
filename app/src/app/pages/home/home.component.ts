import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {SeWelcomeHeaderComponent} from "../../components/se-welcome-header/se-welcome-header.component";
import {SeDateComponent} from "../../components/se-date/se-date.component";
import {SeGreenhouseCardComponent} from "../../components/se-greenhouse-card/se-greenhouse-card.component";
import {GreenhouseDto} from "../../models/greenhouse-dto";
import {GreenhouseService} from "../../services/greenhouse.service";
import {AuthService} from "../../services/auth.service";
import {TranslationService} from "../../services/translation.service";
import {TranslatePipe} from "../../pipes/translate.pipe";

@Component({
  selector: 'se-home',
  standalone: true,
  imports: [
    SeWelcomeHeaderComponent,
    SeDateComponent,
    SeGreenhouseCardComponent,
    TranslatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('header') header!: ElementRef;

  private _greenhouseService = inject(GreenhouseService);
  private _authService = inject(AuthService);
  private _translation = inject(TranslationService);

  greenhouses = signal<GreenhouseDto[]>([]);
  username = signal<string>('');
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    this.username.set(this._translation.translate('common.farmer'));
    const user = await this._authService.getUser();
    if (user) {
      this.username.set(user.name);
    }

    try {
      const data = await this._greenhouseService.getAll();
      this.greenhouses.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  fadeIOHeader(event: any): void {
    if (window.innerWidth >= 1024) {
      this.header.nativeElement.style.opacity = '';
      this.header.nativeElement.style.transform = '';
      return;
    }
    const el = event.target;
    const scrollTop = el.scrollTop;
    const fadeHeight = 100;
    const opacity = Math.max(0, 1 - scrollTop / fadeHeight);
    this.header.nativeElement.style.opacity = opacity.toString();
    this.header.nativeElement.style.transform = `translateY(-${scrollTop}px)`;
  }
}
