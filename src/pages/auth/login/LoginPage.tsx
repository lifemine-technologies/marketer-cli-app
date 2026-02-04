import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { useLoginLogic } from './LoginPageLogic';
import { Controller } from 'react-hook-form';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HorizontalLogo } from '@/components/Logo';
import { useTheme } from '@/hooks/useTheme';

export const LoginPage = () => {
  const { loginForm, loginMutation, onSubmit } = useLoginLogic();
  const [showPassword, setShowPassword] = useState(false);
  const { isDark } = useTheme();

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <View className="w-full space-y-6">
        <View className="mb-10 items-center">
          <View className="mb-6">
            <HorizontalLogo
              width={200}
              height={51}
              color={isDark ? '#f1f5f9' : '#111827'}
            />
          </View>
          <Text className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-slate-100">
            Marketer App
          </Text>
          <Text className="text-center text-sm text-gray-600 dark:text-slate-400">
            Sign in to continue
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30">
          <View className="space-y-5">
            <Controller
              control={loginForm.control}
              name="phone"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View className="mb-2">
                  <View className="relative">
                    <View className="absolute left-3 top-3.5 z-10 ">
                      <Ionicons name="call" size={20} color="#9ca3af" />
                    </View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Phone number"
                      type="tel"
                      disabled={loginMutation.isPending}
                      error={error?.message}
                      className="pl-10"
                    />
                  </View>
                </View>
              )}
            />

            <Controller
              control={loginForm.control}
              name="password"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View>
                  <View className="relative">
                    <View className="absolute left-3 top-3.5 z-10">
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#9ca3af"
                      />
                    </View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      disabled={loginMutation.isPending}
                      error={error?.message}
                      className="pl-10 pr-10"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 z-10"
                      disabled={loginMutation.isPending}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <View className="flex-row items-center justify-between pt-1">
              <Controller
                control={loginForm.control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => !loginMutation.isPending && onChange(!value)}
                    className="flex-row items-center gap-2"
                    disabled={loginMutation.isPending}
                    activeOpacity={0.7}
                  >
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      disabled={loginMutation.isPending}
                    />
                    <Text className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      Remember me
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {loginMutation.isError && (
              <View className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
                <Text className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                  {loginMutation.error?.message ||
                    'Login failed. Please try again.'}
                </Text>
              </View>
            )}

            <Button
              onPress={onSubmit}
              disabled={loginMutation.isPending}
              loading={loginMutation.isPending}
              className="mt-1 w-full"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>

            <View className="items-center pt-2">
              <Text className="text-center text-sm text-gray-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Text className="font-semibold text-blue-600 dark:text-blue-400">
                  Create account
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
