# Calendar Page — Design Spec
**Date:** 2026-04-08
**Status:** Approved

---

## Overview

A full-featured greenhouse task calendar built into the existing Angular 17 + Capacitor app. The page has three vertical sections: a monthly calendar grid, a today strip, and a filtered task list. Tasks are created via a FAB-triggered bottom sheet and persisted via Capacitor Preferences.

---

## Data Model

```ts
// app/src/app/models/greenhouse-task.ts
export interface GreenhouseTask {
  id: string;
  title: string;
  date: Date;
  time: string; // "HH:mm"
  type: 'reminder' | 'system_command';
  note?: string;
  notificationEnabled?: boolean;
  device?: string;
  action?: string;
  duration?: number; // minutes
  zone?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'custom';
  recurringIntervalDays?: number;
}
```

Dummy greenhouse/device data lives as a constant in `TaskService`, clearly marked `// TODO: replace with API call`. Format: `{ id, name, actions: string[] }[]`.

---

## Architecture

**Pattern:** Option B — smart page + focused sub-components + service.

```
pages/calendar/
  calendar.component.ts       # orchestrator, owns selectedDate signal, FAB, bottom sheet

components/calendar/
  se-calendar-grid/           # monthly grid, dot indicators, month navigation
  se-today-strip/             # horizontally scrollable today chips
  se-task-list/               # task cards for selected day

services/
  task.service.ts             # single source of truth: signal<GreenhouseTask[]>

models/
  greenhouse-task.ts          # GreenhouseTask interface
  constants/storage-paths.ts  # add TASKS = 'tasks'
```

---

## TaskService

- Holds `tasks = signal<GreenhouseTask[]>([])`
- `loadTasks()` — async, called by CalendarComponent on init; reads from `StorageService` under `StoragePaths.TASKS`
- `tasksForDay(date: Date)` — method returning tasks filtered by date (derives from signal)
- `tasksForToday()` — `computed()` convenience (no argument, uses current date)
- `add(task: GreenhouseTask)` — mutates signal + persists
- `update(task: GreenhouseTask)` — replaces by id + persists
- `remove(id: string)` — filters out + persists
- `greenhouses` — dummy constant array of `{ id, name, actions }` for device picker

---

## Components

### se-calendar-grid
- **Inputs:** `tasks: GreenhouseTask[]`, `selectedDate: Date`, `today: Date`
- **Outputs:** `daySelected: EventEmitter<Date>`
- Internal signals: `viewMonth`, `viewYear` (for navigation)
- Computes a `dayTaskMap: Map<string, GreenhouseTask[]>` from tasks input
- Each day cell: day number + up to 3 colored dots (blue = reminder, green = system_command); if >3 tasks show "+N"
- Today cell: highlighted border (`border-se-jungle`)
- Selected cell: filled background (`bg-se-green text-white`)
- Prev/next arrows mutate `viewMonth`/`viewYear`

### se-today-strip
- **Inputs:** `tasks: GreenhouseTask[]` (today's tasks)
- **Outputs:** `taskSelected: EventEmitter<string>` (task id)
- Horizontally scrollable row of chips
- Chip: task title + icon (Bell for reminder, Zap for system_command) from lucide-angular
- Empty state: "No tasks today" in muted text

### se-task-list
- **Inputs:** `tasks: GreenhouseTask[]`, `selectedDate: Date`
- **Outputs:** `editTask: EventEmitter<GreenhouseTask>`, `deleteTask: EventEmitter<string>`
- Header: formatted selected date ("Tuesday, April 8")
- Tasks sorted by `time` string
- Task card fields:
  - Time, title, type badge ("Reminder" in blue, "System Command" in green)
  - Reminder: note + notification indicator
  - System Command: device name + action label + duration
  - Zone tag if present
- **Web:** each card has a `···` button (same pattern as `se-ellipsis-menu`) revealing Edit + Delete
- **Native:** swipe-left gesture reveals Edit + Delete

### CalendarComponent (page)
- Owns: `selectedDate = signal<Date>(today)`, `showSheet = signal(false)`, `editingTask = signal<GreenhouseTask | null>(null)`
- Calls `taskService.loadTasks()` in `ngOnInit`
- Passes computed task slices to sub-components
- FAB: fixed bottom-right, opens bottom sheet
- Tapping a chip in today strip: sets `selectedDate` to today + scrolls task list

---

## Bottom Sheet (Create / Edit)

Inline overlay, same pattern as threshold card modal. Fields:

| Field | Type | Condition |
|---|---|---|
| Title | text input | always |
| Date | `<input type="date">` | always |
| Time | `<input type="time">` | always |
| Type | toggle: Reminder / System Command | always |
| Note | textarea | Reminder only |
| Notification | toggle | Reminder only |
| Device | dropdown | System Command only |
| Action | dropdown (filtered by device) | System Command only |
| Duration | number input (minutes) | System Command only |
| Zone/Crop | text input | optional, always |
| Recurring | select: none/daily/weekly/custom | always |
| Interval days | number input | custom recurring only |

On submit: calls `taskService.add()` or `taskService.update()`. Closes sheet. If reminder + notificationEnabled: schedules local notification.

---

## Local Notifications

- Package: `@capacitor/local-notifications` (install required)
- Permission requested once on first reminder task with notification enabled
- Schedule on add/edit; cancel by id on delete or when notification toggled off
- Notification id: derived from task id (hash to integer)
- Web: plugin degrades gracefully (no-op on web)

---

## Reactivity

All sub-components receive `computed()` slices from `TaskService.tasks` signal. Adding/editing/deleting a task immediately updates: calendar dots, today strip chips, and task list cards — no page reload needed.

---

## Open Tasks

- API endpoints for tasks (create, read, update, delete) — see `TASKS.md`
- Replace dummy greenhouse/device data with API call in `TaskService`
- Sync local tasks to API on connectivity
