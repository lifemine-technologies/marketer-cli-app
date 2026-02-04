import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface EmptyStateProps {
  hasSearchQuery: boolean;
}

export function EmptyState({ hasSearchQuery }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16">
      <Ionicons name="people-outline" size={48} color="#9ca3af" />
      <Text className="mt-4 text-center text-base text-gray-500 dark:text-slate-400">
        No coordinators found
      </Text>
      <Text className="mt-1 text-center text-sm text-gray-400 dark:text-slate-500">
        {hasSearchQuery
          ? 'Try adjusting your search'
          : 'No coordinators available'}
      </Text>
    </View>
  );
}
