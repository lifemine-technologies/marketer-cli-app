import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { quickActions } from '../constants';

export interface QuickActionsProps {
  actions: typeof quickActions;
  onActionPress: (screen: string) => void;
}

export function QuickActions({ actions, onActionPress }: QuickActionsProps) {
  return (
    <View className="mb-6">
      <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-slate-100">
        Quick Actions
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {actions.map(action => (
          <TouchableOpacity
            key={action.title}
            onPress={() => onActionPress(action.screen)}
            className="min-w-[45%] flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-95 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
          >
            <View
              className={`h-14 w-14 ${action.color} mb-4 items-center justify-center rounded-2xl shadow-lg`}
            >
              <Ionicons name={action.icon} size={26} color="#ffffff" />
            </View>
            <Text className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
