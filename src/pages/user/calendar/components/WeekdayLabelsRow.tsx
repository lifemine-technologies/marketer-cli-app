import React from 'react';
import { View, Text } from 'react-native';
import { getWeekdayLabels } from '@/utils/dateUtils';

/**
 * Row of weekday labels (Mon, Tue, Wed, ...) above the calendar grid.
 */
export function WeekdayLabelsRow() {
  const labels = getWeekdayLabels();
  return (
    <View className="mx-4 mb-1 flex-row">
      {labels.map(label => (
        <View
          key={label}
          className="flex-1 items-center py-1"
          style={{ minWidth: 0 }}
        >
          <Text className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
