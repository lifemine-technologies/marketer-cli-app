import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface FollowUp {
  _id: string;
  note: string;
  date: string;
}

export interface FollowUpsCardProps {
  followUps?: FollowUp[];
  vendorId: string;
  onAddFollowUp: () => void;
}

export function FollowUpsCard({
  followUps,
  onAddFollowUp,
}: FollowUpsCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
              <Ionicons name="calendar-outline" size={18} color="#2563eb" />
            </View>
            <CardTitle className="ml-2 text-base">Follow-ups</CardTitle>
          </View>
          <TouchableOpacity
            onPress={onAddFollowUp}
            className="rounded-lg bg-blue-600 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-white">Add</Text>
          </TouchableOpacity>
        </View>
      </CardHeader>
      <CardContent className="space-y-3 gap-2">
        {followUps && followUps.length > 0 ? (
          followUps.map(fu => (
            <View
              key={fu._id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <Text className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {fu.note}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#2563eb" />
                <Text className="ml-1.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                  {new Date(fu.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-8">
            <Ionicons
              name="calendar-outline"
              size={48}
              color="#9ca3af"
              style={{ opacity: 0.4 }}
            />
            <Text className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              No follow-up activities scheduled
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
