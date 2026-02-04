import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface NotesCardProps {
  note?: string;
}

export function NotesCard({ note }: NotesCardProps) {
  if (!note) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="document-text-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Notes</CardTitle>
        </View>
      </CardHeader>
      <CardContent>
        <Text className="text-sm leading-6 text-gray-600 dark:text-slate-400">
          {note}
        </Text>
      </CardContent>
    </Card>
  );
}
