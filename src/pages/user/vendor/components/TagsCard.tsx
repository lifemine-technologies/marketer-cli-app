import React from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface TagsCardProps {
  tags?: string[];
}

export function TagsCard({ tags }: TagsCardProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="pricetag-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Tags</CardTitle>
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row flex-wrap">
          {tags.map((tag, index) => (
            <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
              <Badge variant="default">#{tag}</Badge>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
