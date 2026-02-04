import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { MarketerFormData } from '@/hooks/useAddMarketerPage';

export interface RoleSelectionSectionProps {
  control: Control<MarketerFormData>;
  errors: FieldErrors<MarketerFormData>;
  allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[];
}

export function RoleSelectionSection({
  control,
  errors,
  allowedRoles,
}: RoleSelectionSectionProps) {
  return (
    <View className="space-y-4 pt-2">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="person-circle" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Role Assignment
        </Text>
      </View>

      <View className="space-y-1.5">
        <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          Select Role <Text className="text-red-500"> *</Text>
        </Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2">
              {allowedRoles.map(role => (
                <TouchableOpacity
                  key={role}
                  onPress={() => onChange(role)}
                  className={`min-w-[100px] flex-1 rounded-xl border-2 px-4 py-3 ${
                    value === role
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      value === role
                        ? 'text-white'
                        : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.role && (
          <Text className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.role.message}
          </Text>
        )}
      </View>
    </View>
  );
}
