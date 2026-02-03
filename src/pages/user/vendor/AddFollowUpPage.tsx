import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAddFollowUp } from '@/hooks/api/useVendors';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';

const followUpSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  note: z.string().min(1, 'Note is required'),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

export const AddFollowUpPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vendorId } = route.params as { vendorId: string };
  const addFollowUpMutation = useAddFollowUp(vendorId);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      date: selectedDate,
      note: '',
    },
  });

  const onSubmit = handleSubmit(async data => {
    try {
      const result = await addFollowUpMutation.mutateAsync({
        date: data.date,
        note: data.note,
      });

      if (result.status === 'success') {
        Alert.alert(
          'Success',
          result.message ?? 'Follow-up added successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          result.message ?? 'Failed to add follow-up. Please try again.',
        );
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ??
        (err?.message as string) ??
        'Failed to add follow-up. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50 dark:bg-slate-900"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-4 py-6">
            {/* Header - same as Expo */}
            <View className="mb-2 space-y-5">
              <View className="rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#ffffff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-white">
                      Add Follow-up
                    </Text>
                    <Text className="text-sm text-blue-100">
                      Schedule a follow-up for this vendor
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Card */}
              <Card>
                <CardContent className="space-y-5">
                  <View className="space-y-2.5">
                    <Controller
                      control={control}
                      name="date"
                      render={({ field: { onChange } }) => (
                        <View className="space-y-2.5">
                          <Text className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                            Date <Text className="text-red-500"> *</Text>
                          </Text>

                          <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <Text className="text-gray-900 dark:text-slate-100">
                              {selectedDate}
                            </Text>
                          </TouchableOpacity>

                          {showDatePicker && (
                            <DateTimePicker
                              value={new Date(selectedDate)}
                              mode="date"
                              display={
                                Platform.OS === 'ios' ? 'inline' : 'default'
                              }
                              onChange={(_event, date) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (date) {
                                  const formattedDate = date
                                    .toISOString()
                                    .split('T')[0];
                                  setSelectedDate(formattedDate);
                                  setValue('date', formattedDate);
                                  onChange(formattedDate);
                                }
                              }}
                            />
                          )}

                          {errors.date && (
                            <Text className="text-sm text-red-600 dark:text-red-400">
                              {errors.date.message}
                            </Text>
                          )}
                        </View>
                      )}
                    />
                  </View>

                  <View className="mb-2 space-y-2.5">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Note <Text className="text-red-500"> *</Text>
                    </Text>
                    <Controller
                      control={control}
                      name="note"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Enter follow-up note"
                          multiline
                          numberOfLines={4}
                          className="min-h-[100px]"
                          error={errors.note?.message}
                        />
                      )}
                    />
                  </View>

                  <Button
                    onPress={onSubmit}
                    disabled={addFollowUpMutation.isPending}
                    className="rounded-xl bg-blue-600 py-2"
                  >
                    {addFollowUpMutation.isPending ? (
                      <Text className="text-base font-semibold text-white">
                        Adding...
                      </Text>
                    ) : (
                      <Text className="text-base font-semibold text-white">
                        Add Follow-up
                      </Text>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
