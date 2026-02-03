import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
  const [showDatePickerIndex, setShowDatePickerIndex] = useState<number | null>(
    null,
  );

  const handleDateChange = (
    index: number,
    onChange: (val: string) => void,
    _event: unknown,
    selectedDate?: Date,
  ) => {
    setShowDatePickerIndex(null);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const handleAddFollowUp = () => {
    const today = new Date().toISOString().split('T')[0];
    appendFollowUp({ date: today, note: '' });
  };

  return (
    <Card className="mb-2">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Ionicons name="calendar-outline" size={18} color="#2563eb" />
            </View>
            <CardTitle>Follow-ups</CardTitle>
          </View>
          <TouchableOpacity
            onPress={handleAddFollowUp}
            className="rounded-xl bg-blue-600 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              Add Follow-up
            </Text>
          </TouchableOpacity>
        </View>
      </CardHeader>
      <CardContent>
        {followUpFields.length === 0 ? (
          <Text className="text-gray-500 dark:text-slate-400">
            No follow-ups yet
          </Text>
        ) : (
          <View className="space-y-4">
            {followUpFields.map((field, index) => (
              <View
                key={field.id}
                className="border-b border-gray-100 pb-4 last:border-0 dark:border-slate-700"
              >
                <View className="flex-row items-start gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                    <Ionicons name="time-outline" size={18} color="#2563eb" />
                  </View>
                  <View className="flex-1">
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
                              className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-800"
                            >
                              <Text className="text-gray-900 dark:text-slate-100">
                                {value || 'Select date'}
                              </Text>
                            </TouchableOpacity>

                            {showDatePickerIndex === index && (
                              <DateTimePicker
                                value={value ? new Date(value) : new Date()}
                                mode="date"
                                display={
                                  Platform.OS === 'ios' ? 'spinner' : 'default'
                                }
                                onChange={(event, selectedDate) =>
                                  handleDateChange(
                                    index,
                                    onChange,
                                    event,
                                    selectedDate,
                                  )
                                }
                              />
                            )}
                            {errors.followUps?.[index]?.date && (
                              <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
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
                      className="mt-2 self-end rounded-lg bg-red-600 px-3 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-white">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
};
