import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardContent } from '@/components/ui/Card';

export interface VendorFooterCardProps {
  createdAt?: string;
  updatedAt?: string;
}

export function VendorFooterCard({
  createdAt,
  updatedAt,
}: VendorFooterCardProps) {
  return (
    <Card className="bg-gray-100/50 dark:bg-slate-800/50">
      <CardContent className="p-4">
        <View>
          <Text className="text-sm text-gray-600 dark:text-slate-400">
            <Text className="font-semibold">Created:</Text>{' '}
            {createdAt
              ? new Date(createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'N/A'}
          </Text>
          {updatedAt && (
            <Text className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              <Text className="font-semibold">Last Updated:</Text>{' '}
              {new Date(updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      </CardContent>
    </Card>
  );
}
