import {Component, computed, input, output} from '@angular/core';
import {LucideAngularModule, Bell, Zap, BellOff} from 'lucide-angular';
import {GreenhouseTask} from '../../../models/greenhouse-task';
import {SeEllipsisMenuComponent} from '../../shared/se-ellipsis-menu/se-ellipsis-menu.component';
import {Item} from '../../../models/core/item';

@Component({
  selector: 'se-task-list',
  standalone: true,
  imports: [LucideAngularModule, SeEllipsisMenuComponent],
  templateUrl: './se-task-list.component.html',
  styleUrl: './se-task-list.component.scss',
})
export class SeTaskListComponent {
  readonly BellIcon = Bell;
  readonly BellOffIcon = BellOff;
  readonly ZapIcon = Zap;

  tasks = input.required<GreenhouseTask[]>();
  selectedDate = input.required<Date>();

  editTask = output<GreenhouseTask>();
  deleteTask = output<string>();

  readonly cardMenuItems: Item[] = [
    {id: 'edit', value: 'Edit'},
    {id: 'delete', value: 'Delete'},
  ];

  readonly formattedDate = computed(() =>
    new Date(this.selectedDate()).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
  );

  readonly sortedTasks = computed(() =>
    [...this.tasks()].sort((a, b) => a.time.localeCompare(b.time))
  );

  onMenuAction(action: string, task: GreenhouseTask): void {
    if (action === 'edit') this.editTask.emit(task);
    if (action === 'delete') this.deleteTask.emit(task.id);
  }
}
