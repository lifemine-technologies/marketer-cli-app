import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { sameDay } from '@/utils/dateUtils';
import type { CalendarEvent } from '@/hooks/api/useFollowUpCalendar';
import { getEventDotClass } from '../constants';

export interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

/**
 * Week view: horizontal scroll of day columns with events listed per day.
 */
export function WeekView({
  weekDays,
  selectedDate,
  today,
  getEventsForDate,
  onSelectDate,
}: WeekViewProps) {
  return (
    <View
      key="week-view"
      style={{ height: 340, marginHorizontal: 16, marginBottom: 24 }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {weekDays.map((date, idx) => {
          const dayEvents = getEventsForDate(date);
          const isSelected = sameDay(date, selectedDate);
          const isToday = sameDay(date, today);
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectDate(date)}
              style={{
                width: 96,
                height: 320,
                marginRight: 8,
                padding: 8,
              }}
            >
              <View
                className={`flex-1 flex-col rounded-lg border p-2 ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/30'
                    : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-800'
                }`}
              >
                <View className="items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                  <Text className="text-[8px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text
                    className={`mt-1 text-base font-bold ${
                      isToday
                        ? 'rounded-full bg-blue-600 w-8 h-8 text-center leading-8 text-white'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                </View>
                <ScrollView
                  style={{ flex: 1, marginTop: 8 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {dayEvents.map((ev, i) => (
                    <View key={i} className="mb-2">
                      <View className="flex-row items-center gap-1">
                        <View
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${getEventDotClass(ev.type)}`}
                        />
                        <Text
                          className="text-[10px] font-bold text-gray-900 dark:text-slate-100 truncate"
                          numberOfLines={1}
                        >
                          {ev.name}
                        </Text>
                      </View>
                      <Text className="text-[8px] font-bold uppercase text-gray-500 dark:text-slate-400 pl-2">
                        {ev.status === 'COMPLETED' ? 'Done' : 'Pending'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
