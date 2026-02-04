/**
 * Calendar page constants and shared helpers.
 */

export const MONTH_GRID_GAP = 2;

export const EVENT_TYPE_COLOR: Record<string, string> = {
  VISIT: 'bg-emerald-500',
  CALL: 'bg-blue-500',
  TASK: 'bg-violet-500',
  REVIEW: 'bg-amber-500',
};

export function getEventDotClass(type: string): string {
  return EVENT_TYPE_COLOR[type] ?? 'bg-gray-500';
}
