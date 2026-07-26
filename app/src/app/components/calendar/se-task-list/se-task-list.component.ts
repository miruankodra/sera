import {Component, computed, inject, input, output} from '@angular/core';
import {LucideAngularModule, Bell, Zap, BellOff} from 'lucide-angular';
import {GreenhouseTask} from '../../../models/greenhouse-task';
import {SeEllipsisMenuComponent} from '../../shared/se-ellipsis-menu/se-ellipsis-menu.component';
import {Item} from '../../../models/core/item';
import {TranslationService} from '../../../services/translation.service';
import {TranslatePipe} from '../../../pipes/translate.pipe';

const INTL_LOCALE: Record<string, string> = {en: 'en-US', sq: 'sq-AL'};

@Component({
  selector: 'se-task-list',
  standalone: true,
  imports: [LucideAngularModule, SeEllipsisMenuComponent, TranslatePipe],
  templateUrl: './se-task-list.component.html',
  styleUrl: './se-task-list.component.scss',
})
export class SeTaskListComponent {
  private _translation = inject(TranslationService);

  readonly BellIcon = Bell;
  readonly BellOffIcon = BellOff;
  readonly ZapIcon = Zap;

  tasks = input.required<GreenhouseTask[]>();
  selectedDate = input.required<Date>();

  editTask = output<GreenhouseTask>();
  deleteTask = output<string>();

  readonly cardMenuItems = computed<Item[]>(() => [
    {id: 'edit', value: this._translation.translate('common.edit')},
    {id: 'delete', value: this._translation.translate('common.delete')},
  ]);

  readonly formattedDate = computed(() => {
    const locale = INTL_LOCALE[this._translation.locale()] ?? 'en-US';
    const formatted = new Date(this.selectedDate()).toLocaleDateString(locale, {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

  readonly sortedTasks = computed(() =>
    [...this.tasks()].sort((a, b) => a.time.localeCompare(b.time))
  );

  onMenuAction(action: string, task: GreenhouseTask): void {
    if (action === 'edit') this.editTask.emit(task);
    if (action === 'delete') this.deleteTask.emit(task.id);
  }

  actionLabel(action: string | undefined): string {
    if (!action) return '';
    return this._translation.translate(action === 'turn_on' ? 'greenhouse.turnOn' : 'greenhouse.turnOff');
  }
}
