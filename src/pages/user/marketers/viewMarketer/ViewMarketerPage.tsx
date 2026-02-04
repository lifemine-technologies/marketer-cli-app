import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMarketer } from '@/hooks/api/useMarketers';

export const ViewMarketerPage = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { data, isLoading, isError, error } = useMarketer(id);

  const marketer = data?.data;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-center text-gray-600 dark:text-slate-400">
          Loading coordinator details...
        </Text>
      </View>
    );
  }

  if (isError || !marketer) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-slate-900">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-center text-base font-semibold text-red-600 dark:text-red-400">
          Error loading coordinator
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          {error instanceof Error ? error.message : 'Coordinator not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="px-4 py-6">
        <View className="gap-2 space-y-4">
          {/* Header  */}
          <View className="rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
            <View className="mb-5 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <View className="mb-2 flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <Ionicons name="person-outline" size={24} color="#ffffff" />
                  </View>
                  <Text className="flex-1 text-2xl font-bold text-white">
                    {marketer.name || 'N/A'}
                  </Text>
                </View>
              </View>
              <Badge variant="default">{marketer.role}</Badge>
            </View>
            <View className="flex-row items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-3">
              <Ionicons name="call-outline" size={18} color="#ffffff" />
              <Text className="text-base font-semibold text-white">
                {marketer.phone}
              </Text>
            </View>
          </View>

          {/* Details  */}
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <CardTitle className="text-base">Details</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="space-y-4">
              <View>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-500">
                  Identifier
                </Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  {marketer.identifier}
                </Text>
              </View>
              <View>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-500">
                  Created By
                </Text>
                <Text className="text-base text-gray-900 dark:text-slate-100">
                  {marketer.createdByDetails?.name || 'N/A'} (
                  {marketer.createdByDetails?.role || 'N/A'})
                </Text>
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="calendar-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="text-base">Timeline</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="space-y-4">
              <View>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-500">
                  Created At
                </Text>
                <Text className="text-base text-gray-900 dark:text-slate-100">
                  {new Date(marketer.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-500">
                  Updated At
                </Text>
                <Text className="text-base text-gray-900 dark:text-slate-100">
                  {new Date(marketer.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};
