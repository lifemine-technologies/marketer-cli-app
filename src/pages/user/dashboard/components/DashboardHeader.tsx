import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppIcon } from '@/components/AppIcon';

export interface DashboardHeaderProps {
  userRole?: string;
  userPhone?: string;
  onLogout: () => void;
}

export function DashboardHeader({
  userRole,
  userPhone,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <View className="bg-blue-600 px-5 pb-8 pt-16 dark:bg-blue-700">
      <View className="flex-row items-center justify-between">
        {/* LEFT SIDE*/}
        <View className="flex-row items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white p-2">
            <AppIcon width={40} height={40} color="#2563eb" />
          </View>

          <View>
            <Text className="text-xl font-bold text-white">
              Fatafat Service
            </Text>
            <Text className="text-sm text-blue-100">{userRole}</Text>
            <Text className="text-xs text-blue-200">{userPhone}</Text>
          </View>
        </View>

        {/* RIGHT SIDE*/}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onLogout}
            className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={22} color="#ffffff" />
          </TouchableOpacity>

          <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/25">
            <Ionicons name="person-outline" size={28} color="#ffffff" />
          </View>
        </View>
      </View>
    </View>
  );
}
