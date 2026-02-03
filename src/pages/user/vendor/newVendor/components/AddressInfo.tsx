import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';

interface AddressInfoProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
}

export const AddressInfo = ({ control, errors }: AddressInfoProps) => {
  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="location" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">Address</Text>
      </View>

      <View className="space-y-3">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Address Line 1 <Text className="text-red-500"> *</Text>
          </Text>
          <Controller
            control={control}
            name="address.line1"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Street address"
                error={errors.address?.line1?.message}
              />
            )}
          />
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Address Line 2
          </Text>
          <Controller
            control={control}
            name="address.line2"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="Apartment, suite, etc. (optional)"
              />
            )}
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              City <Text className="text-red-500"> *</Text>
            </Text>
            <Controller
              control={control}
              name="address.city"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="City"
                  error={errors.address?.city?.message}
                />
              )}
            />
          </View>

          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              State <Text className="text-red-500"> *</Text>
            </Text>
            <Controller
              control={control}
              name="address.state"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="State"
                  error={errors.address?.state?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Country <Text className="text-red-500"> *</Text>
            </Text>
            <Controller
              control={control}
              name="address.country"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Country"
                  error={errors.address?.country?.message}
                />
              )}
            />
          </View>

          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Pincode <Text className="text-red-500"> *</Text>
            </Text>
            <Controller
              control={control}
              name="address.code"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Pincode"
                  keyboardType="numeric"
                  error={errors.address?.code?.message}
                />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
