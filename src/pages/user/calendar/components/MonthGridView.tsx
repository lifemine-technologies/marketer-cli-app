import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { sameDay } from '@/utils/dateUtils';
import type { CalendarEvent } from '@/hooks/api/useFollowUpCalendar';
import { MONTH_GRID_GAP, getEventDotClass } from '../constants';

export interface MonthGridViewProps {
  monthRows: Date[][];
  contentWidth: number;
  monthCellSize: number;
  currentDate: Date;
  selectedDate: Date;
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

/**
 * Month view: grid of days with event dots and selected/today styling.
 */
export function MonthGridView({
  monthRows,
  contentWidth,
  monthCellSize,
  currentDate,
  selectedDate,
  today,
  getEventsForDate,
  onSelectDate,
}: MonthGridViewProps) {
  return (
    <View className="mx-4 mb-6" style={{ width: contentWidth }}>
      {monthRows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: 'row',
            marginBottom: rowIdx < monthRows.length - 1 ? MONTH_GRID_GAP : 0,
          }}
        >
          {row.map((date, colIdx) => {
            const dayEvents = getEventsForDate(date);
            const isSelected = sameDay(date, selectedDate);
            const isToday = sameDay(date, today);
            const isCurrentMonth =
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear();
            return (
              <TouchableOpacity
                key={`${rowIdx}-${colIdx}`}
                onPress={() => isCurrentMonth && onSelectDate(date)}
                disabled={!isCurrentMonth}
                style={{
                  width: monthCellSize,
                  height: monthCellSize * 0.85,
                  marginRight: colIdx < 6 ? MONTH_GRID_GAP : 0,
                }}
              >
                <View
                  className={`h-full flex-col rounded-lg border p-1 ${
                    !isCurrentMonth
                      ? 'border-transparent bg-gray-100/50 dark:bg-slate-800/30 opacity-50'
                      : isSelected
                        ? 'border-blue-400 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/30'
                        : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-800'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      isToday
                        ? 'rounded-full bg-blue-600 w-5 h-5 text-center leading-5 text-white'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                  <View className="mt-auto flex-row flex-wrap gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 4).map((ev, i) => (
                      <View
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${getEventDotClass(ev.type)}`}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <Text className="text-[8px] font-bold text-gray-400 leading-none self-center ml-0.5">
                        +{dayEvents.length - 4}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
