import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import type { Marketer } from '@/hooks/api/useMarketers';

export interface MarketerCardProps {
  marketer: Marketer;
  onPress: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export function MarketerCard({ marketer, onPress }: MarketerCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-[0.98] active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
    >
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/30">
              <Ionicons name="person-outline" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
                {marketer.name || 'N/A'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-slate-900/50">
            <Ionicons name="call-outline" size={14} color="#2563eb" />
            <Text className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {marketer.phone}
            </Text>
          </View>
        </View>
        <Badge variant="default">{marketer.role}</Badge>
      </View>

      <View className="space-y-3 border-t border-gray-100 pt-4 dark:border-slate-700">
        <View className="flex-row items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
          <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-slate-500">
              Created by
            </Text>
            <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              {marketer.createdByDetails?.name || 'N/A'}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-800/30 dark:bg-blue-900/20">
          <Ionicons name="calendar-outline" size={14} color="#2563eb" />
          <Text className="text-xs font-medium text-gray-700 dark:text-slate-300">
            {formatDate(marketer.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
