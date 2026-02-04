import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/Button';

export interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel?: string;
}

export function FormActions({
  onCancel,
  onSubmit,
  isPending,
  submitLabel = 'Add Coordinator',
}: FormActionsProps) {
  return (
    <View className="flex-row gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
      <Button
        variant="outline"
        className="flex-1 rounded-xl border-gray-300 py-2 dark:border-slate-600"
        onPress={onCancel}
      >
        <Text className="text-base font-semibold text-gray-700 dark:text-slate-300">
          Cancel
        </Text>
      </Button>
      <Button
        onPress={onSubmit}
        disabled={isPending}
        className="flex-1 rounded-xl bg-blue-600 py-2"
      >
        {isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-base font-semibold text-white">
            {submitLabel}
          </Text>
        )}
      </Button>
    </View>
  );
}
