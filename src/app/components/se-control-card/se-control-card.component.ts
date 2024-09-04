import {AfterViewInit, ChangeDetectorRef, Component, inject, input, output, OutputEmitterRef} from '@angular/core';
import {SeCardComponent} from "../shared/se-card/se-card.component";
import {SeSwitchComponent} from "../shared/se-switch/se-switch.component";
import {SeTitleComponent} from "../shared/se-title/se-title.component";
import {NgStyle} from "@angular/common";

@Component({
  selector: 'se-control-card',
  standalone: true,
  imports: [
    SeCardComponent,
    SeSwitchComponent,
    SeTitleComponent,
    NgStyle
  ],
  templateUrl: './se-control-card.component.html',
  styleUrl: './se-control-card.component.scss'
})
export class SeControlCardComponent implements AfterViewInit {

  title = input<string>('Title');
  subtitle = input<string>('Subtitle')
  onIcon = input<string>('');
  offIcon = input<string>('');
  initState = input<boolean>(false);

  onToggle: OutputEmitterRef<boolean> = output<boolean>();
  isToggled: boolean = false;
  private _cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.isToggled = this.initState();
    this._cdr.detectChanges();
  }

  toggleSwitch(switchToggled: boolean): void {
    this.isToggled = !this.isToggled;
    this.onToggle.emit(switchToggled);
  }

}
