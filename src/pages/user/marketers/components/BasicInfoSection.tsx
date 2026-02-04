import React from 'react';
import { View, Text } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Input } from '@/components/ui/Input';
import type { MarketerFormData } from '@/hooks/useAddMarketerPage';

export interface BasicInfoSectionProps {
  control: Control<MarketerFormData>;
  errors: FieldErrors<MarketerFormData>;
}

export function BasicInfoSection({ control, errors }: BasicInfoSectionProps) {
  return (
    <View className="space-y-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="information-circle" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Basic Information
        </Text>
      </View>

      <View className="space-y-3">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Full Name <Text className="text-red-500"> *</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Enter coordinator name"
                error={errors.name?.message}
              />
            )}
          />
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Phone Number <Text className="text-red-500"> *</Text>
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Password <Text className="text-red-500"> *</Text>
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Enter password"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />
          <Text className="text-xs text-gray-500 dark:text-slate-400">
            Password must be at least 8 characters
          </Text>
        </View>
      </View>
    </View>
  );
}
