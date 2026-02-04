import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ServiceLocationsCardProps {
  servicePlaces?: string[];
}

export function ServiceLocationsCard({
  servicePlaces,
}: ServiceLocationsCardProps) {
  if (!servicePlaces || servicePlaces.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="globe-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Service Locations</CardTitle>
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row flex-wrap">
          {servicePlaces.map((place, index) => (
            <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
              <Badge variant="secondary">
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={12} color="#2563eb" />
                  <Text className="ml-1">{place}</Text>
                </View>
              </Badge>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
