import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent } from '@/components/ui/Card';

// Format time to AM/PM
const formatTime = (hour?: number) => {
  if (hour === undefined) return 'N/A';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
};

export interface QuickStatsCardProps {
  businessStartTime?: number;
  businessEndTime?: number;
  isTechnicianAvailable?: boolean;
  noOfTechnicians?: number;
}

export function QuickStatsCard({
  businessStartTime,
  businessEndTime,
  isTechnicianAvailable,
  noOfTechnicians,
}: QuickStatsCardProps) {
  const hasBusinessHours =
    businessStartTime !== undefined && businessEndTime !== undefined;

  return (
    <View className="mb-4 flex-col gap-4">
      {hasBusinessHours && (
        <Card className="flex-1">
          <CardContent className="p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Ionicons name="time-outline" size={20} color="#2563eb" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
                  Business Hours
                </Text>
                <Text className="mt-1 text-sm font-bold text-gray-900 dark:text-slate-100">
                  {formatTime(businessStartTime)} -{' '}
                  {formatTime(businessEndTime)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1">
        <CardContent className="p-4">
          <View className="flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-lg ${
                isTechnicianAvailable
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={isTechnicianAvailable ? '#2563eb' : '#ef4444'}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
                Technicians
              </Text>
              <Text
                className={`mt-1 text-sm font-bold ${
                  isTechnicianAvailable
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isTechnicianAvailable
                  ? `${noOfTechnicians || 0} Available`
                  : 'Unavailable'}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
