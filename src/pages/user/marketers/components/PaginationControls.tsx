import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <View className="mt-6 flex-row items-center justify-center gap-4">
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={onPrev}
        className={`rounded-lg px-4 py-2 ${
          currentPage === 1 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600'
        }`}
      >
        <Text className="text-white">Previous</Text>
      </TouchableOpacity>
      <Text className="text-gray-700 dark:text-slate-300">
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={onNext}
        className={`rounded-lg px-4 py-2 ${
          currentPage === totalPages
            ? 'bg-gray-300 dark:bg-gray-700'
            : 'bg-blue-600'
        }`}
      >
        <Text className="text-white">Next</Text>
      </TouchableOpacity>
    </View>
  );
}
