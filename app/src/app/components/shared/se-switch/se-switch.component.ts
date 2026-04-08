import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  OutputEmitterRef,
  ViewChild
} from '@angular/core';
import {SeTitleComponent} from "../se-title/se-title.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'se-switch',
  standalone: true,
  imports: [
    SeTitleComponent,
    NgClass
  ],
  templateUrl: './se-switch.component.html',
  styleUrl: './se-switch.component.scss'
})
export class SeSwitchComponent implements AfterViewInit {
  label = input<string>();
  labelColor = input<string>('text-white');
  labelSize = input<string>('text-[20px]');
  labelWeight = input<string>('font-semibold');
  initState = input<boolean>(false)

  @ViewChild('checkbox') checkbox?: ElementRef;
  private _cdr = inject(ChangeDetectorRef);

  onToggle: OutputEmitterRef<boolean> = output<boolean>();

  ngAfterViewInit(): void {
    if (this.checkbox) {
      (this.checkbox?.nativeElement as HTMLInputElement).checked = this.initState();
    }
    this._cdr.detectChanges();
  }

  toggleSwitch(checkbox: HTMLInputElement) {
    checkbox.checked = !checkbox.checked;
    this.onToggle.emit(checkbox.checked);
  }
}
