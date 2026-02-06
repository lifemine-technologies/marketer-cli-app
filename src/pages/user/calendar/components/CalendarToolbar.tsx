import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  formatCalendarTitle,
  formatWeekRangeTitle,
  type CalendarViewType,
} from '@/utils/dateUtils';

export interface CalendarToolbarProps {
  view: CalendarViewType;
  onViewChange: (v: CalendarViewType) => void;
  currentDate: Date;
  weekDays: Date[];
  onPrev: () => void;
  onNext: () => void;
  onRefresh: () => void;
  onJumpToToday: () => void;
  isFetching: boolean;
  isSelectedToday: boolean;
  isViewShowingToday: boolean;
}

/**
 * Toolbar: Week/Month toggle, prev/next, title, refresh, and "Today" button.
 */
export function CalendarToolbar({
  view,
  onViewChange,
  currentDate,
  weekDays,
  onPrev,
  onNext,
  onRefresh,
  onJumpToToday,
  isFetching,
  isSelectedToday,
  isViewShowingToday,
}: CalendarToolbarProps) {
  const title =
    view === 'Week' && weekDays.length > 0
      ? formatWeekRangeTitle(weekDays[0])
      : formatCalendarTitle(currentDate);

  return (
    <View className="mx-4 mb-3 flex-row items-center justify-between gap-2">
      {/* <View className="flex-row rounded-lg bg-gray-200/80 p-0.5 dark:bg-slate-700/50 shrink-0">
        {(['Week', 'Month'] as CalendarViewType[]).map(v => (
          <TouchableOpacity
            key={v}
            // onPress={() => onViewChange(v)}
            activeOpacity={0.7}
            className={`rounded-md px-3 py-2 ${
              view === v
                ? 'bg-white dark:bg-slate-600 shadow-sm'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-widest ${
                view === v
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      <View className="flex-1 flex-row items-center justify-center gap-1 min-w-0">
        <TouchableOpacity
          onPress={onPrev}
          className="h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 shrink-0"
        >
          <Ionicons name="chevron-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text
          className="text-center text-xs font-bold uppercase text-gray-900 dark:text-slate-100 px-1"
          numberOfLines={1}
        >
          {title}
        </Text>
        <TouchableOpacity
          onPress={onNext}
          className="h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 shrink-0"
        >
          <Ionicons name="chevron-forward" size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-1 shrink-0">
        <TouchableOpacity
          onPress={onRefresh}
          className="h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-slate-600"
        >
          <Ionicons
            name="refresh"
            size={18}
            color={isFetching ? '#9ca3af' : '#374151'}
          />
        </TouchableOpacity>
        {(!isSelectedToday || !isViewShowingToday) && (
          <TouchableOpacity
            onPress={onJumpToToday}
            className="h-8 flex-row items-center rounded-lg border border-gray-200 bg-white px-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <Ionicons name="today-outline" size={14} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
