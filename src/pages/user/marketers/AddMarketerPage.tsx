import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAddMarketer, type AddMarketerData } from '@/hooks/api/useMarketers';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { phoneNumberSchema, passwordSchema } from '@/utils/validations/primitive';
import { useContext } from 'react';
import { UserProviderContext } from '@/utils/contexts/authUserContext';

const createMarketerSchema = (allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[]) => {
  return z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters'),
    phone: phoneNumberSchema(),
    password: passwordSchema(),
    role: z.enum(allowedRoles as [string, ...string[]], {
      errorMap: () => ({ message: 'Role is required' }),
    }),
  });
};

type MarketerFormData = z.infer<ReturnType<typeof createMarketerSchema>>;

export const AddMarketerPage = () => {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const userRole = user?.role ?? 'COORDINATOR';
  const isAdmin = userRole === 'ADMIN';

  const allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[] = isAdmin
    ? ['MANAGER', 'COORDINATOR', 'TELECALLER']
    : ['COORDINATOR'];

  const marketerSchema = createMarketerSchema(allowedRoles);
  const addMarketerMutation = useAddMarketer();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketerFormData>({
    resolver: zodResolver(marketerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      role: allowedRoles[0],
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await addMarketerMutation.mutateAsync(data as AddMarketerData);

      if (result.status === 'success') {
        Alert.alert('Success', result.message ?? 'Coordinator added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).goBack?.();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message ?? 'Failed to add coordinator. Please try again.');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to add coordinator. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1 bg-gray-50 dark:bg-slate-900"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="px-4 pb-6">
            <View className="space-y-5">
              {/* Header */}
              <View className="mb-2 mt-2 rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <Ionicons name="person-add" size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-white">Add New Coordinator</Text>
                    <Text className="text-sm text-blue-100">Fill in the details below</Text>
                  </View>
                </View>
              </View>

              {/* Form Card */}
              <Card>
                <CardContent className="space-y-6">
                  {/* Basic Information Section */}
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

                  {/* Role Selection Section */}
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
                            {allowedRoles.map((role) => (
                              <TouchableOpacity
                                key={role}
                                onPress={() => onChange(role)}
                                className={`min-w-[100px] flex-1 rounded-xl border-2 px-4 py-3 ${
                                  value === role
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'
                                }`}>
                                <Text
                                  className={`text-center text-sm font-semibold ${
                                    value === role
                                      ? 'text-white'
                                      : 'text-gray-700 dark:text-slate-300'
                                  }`}>
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

                  {/* Actions */}
                  <View className="flex-row gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-gray-300 py-2 dark:border-slate-600"
                      onPress={() => (navigation as any).goBack?.()}>
                      <Text className="text-base font-semibold text-gray-700 dark:text-slate-300">
                        Cancel
                      </Text>
                    </Button>
                    <Button
                      onPress={onSubmit}
                      disabled={addMarketerMutation.isPending}
                      className="flex-1 rounded-xl bg-blue-600 py-2">
                      {addMarketerMutation.isPending ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text className="text-base font-semibold text-white">
                          Add Coordinator
                        </Text>
                      )}
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
