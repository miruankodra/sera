import {Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {LucideAngularModule, ChevronLeft, ChevronRight} from 'lucide-angular';
import {GreenhouseTask} from '../../../models/greenhouse-task';
import {TranslationService} from '../../../services/translation.service';

const INTL_LOCALE: Record<string, string> = {en: 'en-US', sq: 'sq-AL'};

@Component({
  selector: 'se-calendar-grid',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './se-calendar-grid.component.html',
  styleUrl: './se-calendar-grid.component.scss',
})
export class SeCalendarGridComponent {
  private _translation = inject(TranslationService);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  tasks = input.required<GreenhouseTask[]>();
  selectedDate = input.required<Date>();
  today = input.required<Date>();

  daySelected = output<Date>();

  readonly weekDays = computed(() => {
    const locale = INTL_LOCALE[this._translation.locale()] ?? 'en-US';
    const monday = new Date(2024, 0, 1); // a known Monday
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return new Intl.DateTimeFormat(locale, {weekday: 'short'}).format(d);
    });
  });

  readonly viewMonth = signal(new Date().getMonth());
  readonly viewYear = signal(new Date().getFullYear());

  constructor() {
    effect(() => {
      const d = this.selectedDate();
      this.viewMonth.set(d.getMonth());
      this.viewYear.set(d.getFullYear());
    }, {allowSignalWrites: true});
  }

  readonly monthName = computed(() => {
    const locale = INTL_LOCALE[this._translation.locale()] ?? 'en-US';
    const formatted = new Date(this.viewYear(), this.viewMonth()).toLocaleDateString(locale, {month: 'long', year: 'numeric'});
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

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
    const year = this.viewYear();
    const month = this.viewMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.tasks().forEach(task => {
      const start = new Date(task.date);
      const end = task.endDate ? new Date(task.endDate) : start;

      for (let day = 1; day <= daysInMonth; day++) {
        const cell = new Date(year, month, day);
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (cell >= startDay && cell <= endDay) {
          if (!map.has(day)) map.set(day, []);
          map.get(day)!.push(task);
        }
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
