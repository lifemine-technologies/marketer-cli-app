import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';
import type { UseFieldArrayReturn } from 'react-hook-form';

interface FollowUpProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
  appendFollowUp: (value: { date: string; note: string }) => void;
  removeFollowUp: (index: number) => void;
  followUpFields: UseFieldArrayReturn<VendorFormData, 'followUps'>['fields'];
}

export const FollowUp = ({
  control,
  errors,
  appendFollowUp,
  removeFollowUp,
  followUpFields,
}: FollowUpProps) => {
  const [showDatePickerIndex, setShowDatePickerIndex] = useState<number | null>(null);

  const handleDateChange = (
    index: number,
    onChange: (val: string) => void,
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePickerIndex(null);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar" size={20} color="#2563eb" />
          <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">Follow Ups</Text>
        </View>
        <TouchableOpacity
          onPress={() => appendFollowUp({ date: '', note: '' })}
          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5">
          <Text className="text-xs font-semibold text-white">Add</Text>
        </TouchableOpacity>
      </View>

      {followUpFields.map((field, index) => (
        <View
          key={field.id}
          className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <View className="mb-2">
            <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-slate-300">
              Date
            </Text>
            <Controller
              control={control}
              name={`followUps.${index}.date`}
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePickerIndex(index)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
                    <Text className="text-gray-900 dark:text-slate-100">
                      {value || 'Select date'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePickerIndex === index && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) =>
                        handleDateChange(index, onChange, event, selectedDate)
                      }
                    />
                  )}
                  {errors.followUps?.[index]?.date && (
                    <Text className="text-sm text-red-600 dark:text-red-400">
                      {errors.followUps[index].date.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View className="mb-2">
            <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-slate-300">
              Note
            </Text>
            <Controller
              control={control}
              name={`followUps.${index}.note`}
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter follow-up note"
                  multiline
                  numberOfLines={3}
                  className="min-h-[80px]"
                  error={errors.followUps?.[index]?.note?.message}
                />
              )}
            />
          </View>

          <TouchableOpacity
            onPress={() => removeFollowUp(index)}
            className="mt-2 self-end rounded-lg bg-red-600 px-3 py-1.5">
            <Text className="text-xs font-semibold text-white">Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
