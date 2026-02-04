import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFollowUpCalendar,
  type CalendarEvent,
} from '@/hooks/api/useFollowUpCalendar';
import {
  getCalendarDateRange,
  getMonthGridDays,
  getWeekDays,
  sameDay,
  toLocalDateString,
  startOfWeek,
  type CalendarViewType,
} from '@/utils/dateUtils';

const HORIZONTAL_PADDING = 32;
const MONTH_GRID_GAP = 2;

export interface UseCalendarPageReturn {
  // View state
  view: CalendarViewType;
  setView: (v: CalendarViewType) => void;
  handleViewChange: (v: CalendarViewType) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;

  // Data
  events: CalendarEvent[];
  isFetching: boolean;
  refetch: () => void;
  selectedDayEvents: CalendarEvent[];
  monthRows: Date[][];
  weekDays: Date[];
  getEventsForDate: (date: Date) => CalendarEvent[];

  // Handlers
  handlePrev: () => void;
  handleNext: () => void;
  jumpToToday: () => void;

  // Layout (from window + insets)
  contentWidth: number;
  monthCellSize: number;
  scrollPaddingBottom: number;
  topInset: number;

  // Derived for UI
  today: Date;
  isSelectedToday: boolean;
  isViewShowingToday: boolean;
  weekStart: Date;
}

export function useCalendarPage(): UseCalendarPageReturn {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarViewType>('Month');
  const prevViewRef = useRef<CalendarViewType>('Month');

  const contentWidth = Math.max(0, windowWidth - HORIZONTAL_PADDING);
  const monthCellSize =
    contentWidth <= 0 ? 0 : (contentWidth - MONTH_GRID_GAP * 6) / 7;
  const scrollPaddingBottom = 16 + insets.bottom;

  const dateRange = useMemo(
    () => getCalendarDateRange(currentDate, view),
    [currentDate, view],
  );

  const {
    data: events = [],
    isFetching,
    refetch,
  } = useFollowUpCalendar(dateRange.fromDate, dateRange.toDate);

  // Handle view change: when switching to Week, jump to current week
  const handleViewChange = useCallback((newView: CalendarViewType) => {
    if (newView === 'Week') {
      // Jump to current week when switching to Week view
      const today = new Date();
      setCurrentDate(today);
      setView(newView);
      prevViewRef.current = newView;
    } else {
      setView(newView);
      prevViewRef.current = newView;
    }
  }, []);

  // Track view changes and refetch when switching to Week
  useEffect(() => {
    const justSwitchedToWeek =
      prevViewRef.current !== 'Week' && view === 'Week';
    if (justSwitchedToWeek) {
      if (__DEV__) {
        console.log('[Calendar] Switched to Week view, refetching...');
      }
      // Small delay to ensure dateRange memo has recalculated with new currentDate
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timer);
    }
    prevViewRef.current = view;
  }, [view, refetch]);

  const selectedDayStr = toLocalDateString(selectedDate);
  const selectedDayEvents = useMemo(
    () =>
      events.filter(e => {
        const eventDay =
          typeof e.date === 'string' && e.date.length >= 10
            ? e.date.slice(0, 10)
            : toLocalDateString(new Date(e.date));
        return eventDay === selectedDayStr;
      }),
    [events, selectedDayStr],
  );

  const monthDays = useMemo(() => getMonthGridDays(currentDate), [currentDate]);
  const monthRows = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      rows.push(monthDays.slice(i, i + 7));
    }
    return rows;
  }, [monthDays]);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const getEventsForDate = useCallback(
    (date: Date) => {
      const dayStr = toLocalDateString(date);
      return events.filter(e => {
        const eventDay =
          typeof e.date === 'string' && e.date.length >= 10
            ? e.date.slice(0, 10)
            : toLocalDateString(new Date(e.date));
        return eventDay === dayStr;
      });
    },
    [events],
  );

  const handlePrev = useCallback(() => {
    if (view === 'Month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
      );
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  }, [view, currentDate]);

  const handleNext = useCallback(() => {
    if (view === 'Month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
      );
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  }, [view, currentDate]);

  const jumpToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const today = new Date();
  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  const isSelectedToday = sameDay(selectedDate, today);
  const isViewShowingToday =
    (view === 'Month' &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()) ||
    (view === 'Week' && sameDay(weekStart, startOfWeek(today)));

  return {
    view,
    setView,
    handleViewChange,
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    events,
    isFetching,
    refetch,
    selectedDayEvents,
    monthRows,
    weekDays,
    getEventsForDate,
    handlePrev,
    handleNext,
    jumpToToday,
    contentWidth,
    monthCellSize,
    scrollPaddingBottom,
    topInset: insets.top,
    today,
    isSelectedToday,
    isViewShowingToday,
    weekStart,
  };
}
