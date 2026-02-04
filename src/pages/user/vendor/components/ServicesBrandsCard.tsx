import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ServicesBrandsCardProps {
  servicesOffered?: string[];
  brands?: string[];
}

export function ServicesBrandsCard({
  servicesOffered,
  brands,
}: ServicesBrandsCardProps) {
  if (
    (!servicesOffered || servicesOffered.length === 0) &&
    (!brands || brands.length === 0)
  ) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
            <Ionicons name="target-outline" size={18} color="#2563eb" />
          </View>
          <CardTitle className="ml-2 text-base">Services & Brands</CardTitle>
        </View>
      </CardHeader>
      <CardContent className="space-y-4">
        {servicesOffered && servicesOffered.length > 0 ? (
          <View>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="briefcase-outline" size={16} color="#2563eb" />
              <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                Services Offered
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {servicesOffered.map((service, index) => (
                <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Badge variant="default">{service}</Badge>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="briefcase-outline" size={16} color="#2563eb" />
              <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                Services Offered
              </Text>
            </View>
            <Text className="text-sm text-gray-500 dark:text-slate-400">
              No services specified
            </Text>
          </View>
        )}

        {brands && brands.length > 0 ? (
          <View>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="trophy-outline" size={16} color="#2563eb" />
              <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                Brands
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {brands.map((brand, index) => (
                <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Badge variant="outline">{brand}</Badge>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View className="mb-3 flex-row items-center">
              <Ionicons name="trophy-outline" size={16} color="#2563eb" />
              <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                Brands
              </Text>
            </View>
            <Text className="text-sm text-gray-500 dark:text-slate-400">
              No brands specified
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
