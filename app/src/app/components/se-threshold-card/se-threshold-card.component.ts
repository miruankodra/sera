import {Component, input, model, output, signal} from '@angular/core';
import {LucideAngularModule, LucideIconData} from 'lucide-angular';
import {ActionSheet, ActionSheetButtonStyle} from '@capacitor/action-sheet';
import {Capacitor} from '@capacitor/core';
import {SeCardComponent} from '../shared/se-card/se-card.component';
import {SeTitleComponent} from '../shared/se-title/se-title.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'se-threshold-card',
  standalone: true,
  imports: [SeCardComponent, SeTitleComponent, LucideAngularModule, FormsModule],
  templateUrl: './se-threshold-card.component.html',
  styleUrl: './se-threshold-card.component.scss',
})
export class SeThresholdCardComponent {
  title = input<string>('Threshold');
  unit = input<string>('');
  icon = input.required<LucideIconData>();
  iconColor = input<string>('text-lime-400');
  iconBg = input<string>('bg-lime-400/20');

  value = model<string>('');

  edit = output<void>();

  showMenu = signal(false);
  showModal = signal(false);
  inputValue = signal('');

  async openActionSheet(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const result = await ActionSheet.showActions({
        title: this.title(),
        message: this.value() ? `Current threshold: ${this.value()} ${this.unit()}` : 'No threshold set',
        options: [
          {title: 'Edit Threshold'},
          {title: 'Clear Threshold', style: ActionSheetButtonStyle.Destructive},
          {title: 'Cancel', style: ActionSheetButtonStyle.Cancel},
        ],
      });

      if (result.index === 0) {
        this.openEditModal();
      } else if (result.index === 1) {
        this.value.set('');
      }
    } else {
      this.showMenu.set(true);
    }
  }

  openEditModal(): void {
    this.showMenu.set(false);
    this.inputValue.set(this.value());
    this.showModal.set(true);
  }

  clearValue(): void {
    this.value.set('');
    this.showMenu.set(false);
  }

  confirmEdit(): void {
    const num = String(this.inputValue()).trim();
    if (num !== '' && num !== 'null' && num !== 'undefined') {
      this.value.set(num);
    }
    this.showModal.set(false);
  }

  cancelEdit(): void {
    this.showModal.set(false);
  }
}
