import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface AddressCardProps {
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    code: string;
    country: string;
  };
}

export function AddressCard({ address }: AddressCardProps) {
  if (!address) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="location-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Address</CardTitle>
        </View>
      </CardHeader>
      <CardContent className="space-y-2">
        <Text className="text-base font-medium text-gray-900 dark:text-slate-100">
          {address.line1}
        </Text>
        {address.line2 && (
          <Text className="text-base font-medium text-gray-900 dark:text-slate-100">
            {address.line2}
          </Text>
        )}
        <Text className="text-sm text-gray-600 dark:text-slate-400">
          {address.city}, {address.state} {address.code}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-slate-400">
          {address.country}
        </Text>
      </CardContent>
    </Card>
  );
}
