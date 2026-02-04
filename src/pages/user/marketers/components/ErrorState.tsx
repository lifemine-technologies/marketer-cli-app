import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-slate-900">
      <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
      <Text className="mt-4 text-center text-base font-semibold text-red-600 dark:text-red-400">
        Error loading coordinators
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
        {error instanceof Error ? error.message : 'Something went wrong'}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="mt-4 rounded-xl bg-blue-600 px-6 py-3"
      >
        <Text className="font-semibold text-white">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
