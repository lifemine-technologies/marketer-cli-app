import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-4 text-center text-gray-600 dark:text-slate-400">
        Loading vendor details...
      </Text>
    </View>
  );
}
