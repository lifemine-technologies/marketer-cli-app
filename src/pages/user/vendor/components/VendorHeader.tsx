import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';

export interface VendorHeaderProps {
  vendor: {
    _id: string;
    name?: string;
    companyName?: string;
    status?: string;
    priority?: string;
    source?: string;
    phone?: string;
    email?: string;
  };
  onPhonePress: (phone: string) => void;
  onEmailPress: (email: string) => void;
}

export function VendorHeader({
  vendor,
  onPhonePress,
  onEmailPress,
}: VendorHeaderProps) {
  return (
    <View className="mb-4 rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
      <View className="mb-4 flex-row items-center justify-between">
        <View
          className="flex-1 flex-row items-center"
          style={{ marginRight: 12 }}
        >
          <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
            <Ionicons name="storefront-outline" size={24} color="#ffffff" />
          </View>
          <View className="flex-1" style={{ marginLeft: 12 }}>
            <Text className="text-2xl font-bold text-white">
              {vendor.name || 'N/A'}
            </Text>
            {vendor.companyName && (
              <Text className="mt-1 text-base text-white/90">
                {vendor.companyName}
              </Text>
            )}
          </View>
        </View>
        {vendor.status && (
          <Badge variant="default" className="bg-white/20">
            {vendor.status}
          </Badge>
        )}
      </View>

      <View className="mb-3 flex-row flex-wrap">
        {vendor.priority && (
          <View style={{ marginRight: 8, marginBottom: 8 }}>
            <Badge variant="secondary" className="bg-white/20 border-white/30">
              {vendor.priority} Priority
            </Badge>
          </View>
        )}
        {vendor.source && (
          <View style={{ marginRight: 8, marginBottom: 8 }}>
            <Badge variant="secondary" className="bg-white/20 border-white/30">
              {vendor.source}
            </Badge>
          </View>
        )}
      </View>

      {vendor.phone && (
        <TouchableOpacity
          onPress={() => onPhonePress(vendor.phone!)}
          className="flex-row items-center rounded-xl border border-white/30 bg-white/20 px-4 py-3"
        >
          <Ionicons name="call-outline" size={18} color="#ffffff" />
          <Text className="ml-2 text-base font-semibold text-white">
            {vendor.phone}
          </Text>
        </TouchableOpacity>
      )}

      {vendor.email && (
        <TouchableOpacity
          onPress={() => onEmailPress(vendor.email!)}
          className="mt-2 flex-row items-center rounded-xl border border-white/30 bg-white/20 px-4 py-3"
        >
          <Ionicons name="mail-outline" size={18} color="#ffffff" />
          <Text className="ml-2 text-base font-semibold text-white">
            {vendor.email}
          </Text>
        </TouchableOpacity>
      )}

      <View className="mt-4">
        <Text className="text-xs text-white/80 uppercase tracking-wide font-semibold">
          Vendor ID
        </Text>
        <View className="mt-1 bg-white/15 px-3 py-2 rounded-lg border border-white/20">
          <Text className="font-mono text-xs text-white" numberOfLines={1}>
            {vendor._id}
          </Text>
        </View>
      </View>
    </View>
  );
}
