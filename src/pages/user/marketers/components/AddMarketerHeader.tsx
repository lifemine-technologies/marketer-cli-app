import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function AddMarketerHeader() {
  return (
    <View className="mb-2 mt-2 rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
          <Ionicons name="person-add" size={24} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">
            Add New Coordinator
          </Text>
          <Text className="text-sm text-blue-100">
            Fill in the details below
          </Text>
        </View>
      </View>
    </View>
  );
}
