import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ServiceSpecialityCardProps {
  speciality?: Array<{ label: string; experience: number }>;
}

export function ServiceSpecialityCard({
  speciality,
}: ServiceSpecialityCardProps) {
  if (!speciality || !Array.isArray(speciality) || speciality.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="star-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Service Speciality</CardTitle>
        </View>
      </CardHeader>
      <CardContent className="space-y-4">
        <View className="flex-row flex-wrap">
          {speciality.map((spec, index) => (
            <View
              key={index}
              className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
              style={{ marginRight: 12, minWidth: 140 }}
            >
              <Text className="text-base font-bold text-gray-900 dark:text-slate-100">
                {spec?.label || 'N/A'}
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="trophy-outline" size={14} color="#2563eb" />
                <Text className="ml-1.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                  {spec?.experience || 0} years
                </Text>
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
