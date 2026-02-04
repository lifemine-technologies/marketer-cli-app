import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatSelectedDate } from '@/utils/dateUtils';
import { Card } from '@/components/ui/Card';
import type { CalendarEvent } from '@/hooks/api/useFollowUpCalendar';
import { getEventDotClass } from '../constants';

export interface DayVisitsCardProps {
  selectedDate: Date;
  events: CalendarEvent[];
  isSelectedToday: boolean;
  onEventPress: (eventId: string) => void;
}

/**
 * Card showing "Today's visits" or "Day visits" for the selected date,
 * with a scrollable list of follow-up events.
 */
export function DayVisitsCard({
  selectedDate,
  events,
  isSelectedToday,
  onEventPress,
}: DayVisitsCardProps) {
  return (
    <Card className="mx-4 mt-4 mb-2">
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
          {isSelectedToday ? "Today's visits" : 'Day visits'}
        </Text>
        <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          {formatSelectedDate(selectedDate)}
        </Text>
      </View>
      <View style={{ height: 200, overflow: 'hidden' }} className="px-4 pb-4">
        {events.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator
            nestedScrollEnabled
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {events.map((event, index) => (
              <TouchableOpacity
                key={`${event._id}-${index}`}
                activeOpacity={0.7}
                onPress={() => onEventPress(event._id)}
                className="mb-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-slate-600 dark:bg-slate-800/50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1 min-w-0">
                    <View
                      className={`h-2 w-2 rounded-full shrink-0 ${getEventDotClass(event.type)}`}
                    />
                    <Text
                      className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate"
                      numberOfLines={1}
                    >
                      {event.name}
                    </Text>
                  </View>
                  <View className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-slate-600">
                    <Text className="text-[10px] font-bold text-gray-700 dark:text-slate-300">
                      {event.status}
                    </Text>
                  </View>
                </View>
                {event.note ? (
                  <Text
                    className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-1"
                    numberOfLines={2}
                  >
                    {event.note}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="items-center justify-center py-6">
            <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mt-2">
              No visits scheduled
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
