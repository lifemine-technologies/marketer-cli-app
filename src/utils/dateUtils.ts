/**
 * Calendar date helpers. Week = Monday–Sunday (ISO / same as website moment.startOf('week') in en).
 */

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Monday = start of week (ISO / match website) */
export function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date;
}

export function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMonthGridDays(currentMonth: Date): Date[] {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const gridStart = startOfWeek(start);
  const gridEnd = endOfWeek(end);
  const days: Date[] = [];
  const d = new Date(gridStart);
  const safety = new Date(gridEnd);
  safety.setDate(safety.getDate() + 1);
  while (d < safety) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Returns [Monday, Tuesday, ..., Sunday] for the week containing weekAnchor */
export function getWeekDays(weekAnchor: Date): Date[] {
  const start = startOfWeek(weekAnchor);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
      0,
      0,
      0,
      0,
    );
    days.push(d);
  }
  return days;
}

export type CalendarViewType = 'Month' | 'Week';

/** Same logic as website: Month = month + week padding, Week = startOf week to endOf week */
export function getCalendarDateRange(
  currentDate: Date,
  view: CalendarViewType,
): { fromDate: string; toDate: string } {
  let start: Date;
  let end: Date;
  if (view === 'Month') {
    start = startOfWeek(startOfMonth(currentDate));
    end = endOfWeek(endOfMonth(currentDate));
  } else {
    start = startOfWeek(currentDate);
    end = endOfWeek(currentDate);
  }
  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS;
}

export function formatCalendarTitle(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Format week range for header in Week view, e.g. "3–9 Jan 2025" */
export function formatWeekRangeTitle(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startDay = weekStart.getDate();
  const endDay = end.getDate();
  const monthYear = end.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  return `${startDay}–${endDay} ${monthYear}`;
}

export function formatSelectedDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/** YYYY-MM-DD for calendar-day comparison with API dates */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
