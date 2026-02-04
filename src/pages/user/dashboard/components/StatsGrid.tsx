import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface Stat {
  label: string;
  value: string;
  icon: 'storefront' | 'people';
}

export interface StatsGridProps {
  stats: Stat[];
  onStatPress: (stat: Stat) => void;
}

export function StatsGrid({ stats, onStatPress }: StatsGridProps) {
  const getTargetScreen = (label: string): string | undefined => {
    if (label.includes('Vendors')) return 'Vendors';
    if (label.includes('Coordinators')) return 'Coordinators';
    return undefined;
  };

  return (
    <View className="mb-6 flex-row flex-wrap gap-4">
      {stats.map((stat, index) => {
        const targetScreen = getTargetScreen(stat.label);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (targetScreen) {
                onStatPress(stat);
              }
            }}
            className="min-w-[30%] flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-95 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
          >
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/30">
              <Ionicons name={stat.icon} size={24} color="#2563eb" />
            </View>
            <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-slate-100">
              {stat.value}
            </Text>
            <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
              {stat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
