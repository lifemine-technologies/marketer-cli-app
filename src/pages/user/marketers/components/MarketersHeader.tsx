import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Input } from '@/components/ui/Input';

export interface MarketersHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  canAddMarketer: boolean;
  onAddPress: () => void;
}

export function MarketersHeader({
  searchQuery,
  onSearchChange,
  canAddMarketer,
  onAddPress,
}: MarketersHeaderProps) {
  return (
    <View className="bg-blue-600 px-5 pb-6 pt-14 dark:bg-blue-700">
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-1 text-2xl font-bold text-white">
            Coordinators
          </Text>
          <Text className="text-sm text-blue-100">View all coordinators</Text>
        </View>
        {canAddMarketer && (
          <TouchableOpacity
            onPress={onAddPress}
            className="flex-row items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 shadow-lg active:scale-95 active:opacity-90"
          >
            <Ionicons name="add-outline" size={18} color="#2563eb" />
            <Text className="text-sm font-semibold text-blue-600">Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="relative">
        <View className="absolute left-3 top-3.5 z-10">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
        </View>
        <Input
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search Coordinators..."
          className="bg-white pl-10 dark:bg-slate-700"
        />
      </View>
    </View>
  );
}
