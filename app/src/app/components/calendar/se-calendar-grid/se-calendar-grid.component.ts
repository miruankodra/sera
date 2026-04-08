import {Component, computed, input, output, signal} from '@angular/core';
import {LucideAngularModule, ChevronLeft, ChevronRight} from 'lucide-angular';
import {GreenhouseTask} from '../../../models/greenhouse-task';

@Component({
  selector: 'se-calendar-grid',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './se-calendar-grid.component.html',
  styleUrl: './se-calendar-grid.component.scss',
})
export class SeCalendarGridComponent {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  tasks = input.required<GreenhouseTask[]>();
  selectedDate = input.required<Date>();
  today = input.required<Date>();

  daySelected = output<Date>();

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly viewMonth = signal(new Date().getMonth());
  readonly viewYear = signal(new Date().getFullYear());

  readonly monthName = computed(() =>
    new Date(this.viewYear(), this.viewMonth()).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
  );

  readonly calendarDays = computed((): (number | null)[] => {
    const firstDay = new Date(this.viewYear(), this.viewMonth(), 1).getDay();
    const startOffset = (firstDay + 6) % 7; // shift from Sun=0 to Mon=0
    const daysInMonth = new Date(this.viewYear(), this.viewMonth() + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  });

  readonly dayTaskMap = computed((): Map<number, GreenhouseTask[]> => {
    const map = new Map<number, GreenhouseTask[]>();
    this.tasks().forEach(task => {
      const d = new Date(task.date);
      if (d.getFullYear() === this.viewYear() && d.getMonth() === this.viewMonth()) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(task);
      }
    });
    return map;
  });

  getTasksForDay(day: number): GreenhouseTask[] {
    return this.dayTaskMap().get(day) ?? [];
  }

  isToday(day: number): boolean {
    const t = this.today();
    return t.getFullYear() === this.viewYear() && t.getMonth() === this.viewMonth() && t.getDate() === day;
  }

  isSelected(day: number): boolean {
    const s = this.selectedDate();
    return s.getFullYear() === this.viewYear() && s.getMonth() === this.viewMonth() && s.getDate() === day;
  }

  selectDay(day: number): void {
    this.daySelected.emit(new Date(this.viewYear(), this.viewMonth(), day));
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update(y => y - 1);
    } else {
      this.viewMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update(y => y + 1);
    } else {
      this.viewMonth.update(m => m + 1);
    }
  }
}
