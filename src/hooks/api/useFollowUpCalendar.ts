import { useQuery } from '@tanstack/react-query';
import { userAPI, type BasicReturnWithType } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';

export type CalendarEventStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type CalendarEventType = 'VISIT' | 'CALL' | 'TASK' | 'REVIEW';

export interface CalendarEvent {
  _id: string;
  name: string;
  note?: string;
  type: CalendarEventType;
  date: string;
  status: CalendarEventStatus;
}

function getTodayRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

/** Return true if the given date string is on the same calendar day as today (local time). */
function isEventDateToday(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const today = new Date();
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

/**
 * Fetch follow-up calendar events for a date range.
 */
export function useFollowUpCalendar(fromDate?: string, toDate?: string) {
  const range = fromDate && toDate ? { fromDate, toDate } : getTodayRange();

  return useQuery({
    queryKey: ['follow-up-calendar', range.fromDate, range.toDate],
    queryFn: async () => {
      const res = await userAPI.get<BasicReturnWithType<CalendarEvent[]>>(
        API_ENDPOINTS.FOLLOWUP.CALENDAR,
        { params: range },
      );
      return (res.data.data ?? []) as CalendarEvent[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch today's follow-ups only (convenience hook for dashboard).
 * Filters results to events whose date is on the user's local today.
 */
export function useTodaysFollowUps() {
  const query = useFollowUpCalendar();
  const filteredData =
    query.data?.filter((event) => isEventDateToday(event.date)) ?? [];
  return {
    ...query,
    data: filteredData,
  };
}
