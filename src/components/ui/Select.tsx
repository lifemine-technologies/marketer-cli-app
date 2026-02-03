import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          'h-12 w-full flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-slate-600 dark:bg-slate-800',
          disabled && 'opacity-50',
          error && 'border-red-400 dark:border-red-400 bg-red-50 dark:bg-red-900/20',
          className
        )}
        activeOpacity={0.7}>
        <Text
          className={cn(
            'flex-1 text-base',
            selectedOption
              ? 'text-gray-900 dark:text-slate-100'
              : 'text-gray-400 dark:text-slate-500'
          )}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={error ? '#ef4444' : '#6b7280'}
        />
      </TouchableOpacity>

      {error && (
        <Text className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  {placeholder}
                </Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView className="max-h-96">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={cn(
                    'px-4 py-4 border-b border-gray-100 dark:border-slate-700',
                    value === option.value && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  activeOpacity={0.7}>
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={cn(
                        'text-base',
                        value === option.value
                          ? 'font-semibold text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-slate-100'
                      )}>
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons name="checkmark" size={20} color="#2563eb" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
