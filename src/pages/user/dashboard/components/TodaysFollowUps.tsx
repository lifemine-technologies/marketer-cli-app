import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@/components/ui/Card';
import type { CalendarEvent } from '@/hooks/api/useFollowUpCalendar';

export interface TodaysFollowUpsProps {
  events: CalendarEvent[];
  isLoading: boolean;
  onEventPress: (eventId: string) => void;
  onViewCalendar: () => void;
}

export function TodaysFollowUps({
  events,
  isLoading,
  onEventPress,
  onViewCalendar,
}: TodaysFollowUpsProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return 'call-outline';
      case 'VISIT':
        return 'location-outline';
      case 'REVIEW':
        return 'document-text-outline';
      default:
        return 'checkbox-outline';
    }
  };

  return (
    <View className="mb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Today's Follow-ups
        </Text>
        <TouchableOpacity
          onPress={onViewCalendar}
          className="rounded-lg px-3 py-1.5 active:opacity-70"
        >
          <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
            View Calendar
          </Text>
        </TouchableOpacity>
      </View>
      <Card>
        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Loading follow-ups...
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Ionicons
              name="calendar-outline"
              size={40}
              color="#9ca3af"
              style={{ marginBottom: 8 }}
            />
            <Text className="text-center text-sm text-gray-500 dark:text-slate-400">
              No follow-ups scheduled for today
            </Text>
          </View>
        ) : (
          <ScrollView
            className="divide-y divide-gray-100 dark:divide-slate-700  h-[400px]"
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
          >
            {events.map((event, index) => (
              <TouchableOpacity
                key={`${event._id}-${index}`}
                activeOpacity={0.7}
                onPress={() => onEventPress(event._id)}
                className="flex-row items-start gap-3 px-4 py-3"
              >
                <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Ionicons
                    name={getEventIcon(event.type)}
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="font-semibold text-gray-900 dark:text-slate-100"
                    numberOfLines={1}
                  >
                    {event.name}
                  </Text>
                  {event.note ? (
                    <Text
                      className="mt-0.5 text-sm text-gray-600 dark:text-slate-400"
                      numberOfLines={2}
                    >
                      {event.note}
                    </Text>
                  ) : null}
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    <View className="rounded bg-gray-100 px-2 py-0.5 dark:bg-slate-700">
                      <Text className="text-xs font-medium text-gray-600 dark:text-slate-300">
                        {event.type}
                      </Text>
                    </View>
                    <View
                      className={`rounded px-2 py-0.5 ${
                        event.status === 'COMPLETED'
                          ? 'bg-green-100 dark:bg-green-900/40'
                          : event.status === 'CANCELLED'
                            ? 'bg-gray-100 dark:bg-slate-700'
                            : 'bg-amber-100 dark:bg-amber-900/40'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          event.status === 'COMPLETED'
                            ? 'text-green-700 dark:text-green-300'
                            : event.status === 'CANCELLED'
                              ? 'text-gray-600 dark:text-slate-400'
                              : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {event.status}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 dark:text-slate-500">
                      {event.date
                        ? new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Card>
    </View>
  );
}
