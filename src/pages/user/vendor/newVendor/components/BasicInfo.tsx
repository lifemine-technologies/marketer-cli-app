import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';

interface BasicInfoProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
}

export const BasicInfo = ({ control, errors }: BasicInfoProps) => {
  return (
    <View className="space-y-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="information-circle" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Basic Information
        </Text>
      </View>

      <View className="mb-2 space-y-3">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Vendor Name <Text className="text-red-500"> *</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Enter vendor name"
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
            render={({ field: { value, onChange } }) => (
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
            Email Address
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="contact@example.com"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Company Name
          </Text>
          <Controller
            control={control}
            name="companyName"
            render={({ field: { value, onChange } }) => (
              <Input value={value ?? ''} onChangeText={onChange} placeholder="Enter company name" />
            )}
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Priority
            </Text>
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value}
                  onValueChange={onChange}
                  options={[
                    { label: 'Low', value: 'LOW' },
                    { label: 'Medium ', value: 'MEDIUM' },
                    { label: 'High', value: 'HIGH' },
                  ]}
                  placeholder="Select priority"
                  error={errors.priority?.message}
                />
              )}
            />
          </View>

          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">Source</Text>
            <Controller
              control={control}
              name="source"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value}
                  onValueChange={onChange}
                  options={[
                    { label: 'Phone', value: 'PHONE' },
                    { label: 'Email', value: 'EMAIL' },
                    { label: 'Walk-in', value: 'WALKIN' },
                    { label: 'Drive-in', value: 'DRIVEIN' },
                  ]}
                  placeholder="Select source"
                  error={errors.source?.message}
                />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
