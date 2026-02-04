import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@/components/ui/Card';

export interface AttendanceCardProps {
  attendance: any;
  isActive: boolean;
  isGettingLocation: boolean;
  isPunchPending: boolean;
  onPunch: () => void;
}
export function AttendanceCard({
  attendance,
  isActive,
  isGettingLocation,
  isPunchPending,
  onPunch,
}: AttendanceCardProps) {
  return (
    <Card className="-mt-6 mb-6">
      <View className="p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-slate-100">
              Attendance
            </Text>
            {attendance?.punchInTime && (
              <Text className="text-sm text-gray-600 dark:text-slate-400">
                {isActive ? 'Punched in' : 'Punched out'} -{' '}
                {new Date(
                  isActive
                    ? attendance.punchInTime
                    : attendance.punchOutTime || '',
                ).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onPunch}
            disabled={isGettingLocation || isPunchPending}
            className={`${
              isActive ? 'bg-red-600' : 'bg-green-600'
            } flex-row items-center gap-2 rounded-xl px-6 py-3 shadow-lg active:opacity-80`}
          >
            {isGettingLocation || isPunchPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons
                  name={isActive ? 'log-out-outline' : 'log-in-outline'}
                  size={20}
                  color="#ffffff"
                />
                <Text className="font-semibold text-white">
                  {isActive ? 'Punch Out' : 'Punch In'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
