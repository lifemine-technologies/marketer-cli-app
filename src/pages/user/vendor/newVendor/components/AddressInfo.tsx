import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';
import type { UseFormSetValue } from 'react-hook-form';
import { setMapPickerCallback } from '@/utils/mapPickerCallback';

interface AddressInfoProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
  setValue: UseFormSetValue<VendorFormData>;
  addressLatitude?: number;
  addressLongitude?: number;
}

export const AddressInfo = ({
  control,
  errors,
  setValue,
  addressLatitude,
  addressLongitude,
}: AddressInfoProps) => {
  const navigation = useNavigation();

  const handleMapSelect = (result: {
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      code: string;
    };
    latitude: number;
    longitude: number;
  }) => {
    setValue('address.line1', result.address.line1, { shouldValidate: true });
    setValue('address.line2', result.address.line2 ?? '', {
      shouldValidate: true,
    });
    setValue('address.city', result.address.city, { shouldValidate: true });
    setValue('address.state', result.address.state, { shouldValidate: true });
    setValue('address.country', result.address.country, {
      shouldValidate: true,
    });
    setValue('address.code', result.address.code, { shouldValidate: true });
    setValue('address.latitude', result.latitude, { shouldValidate: true });
    setValue('address.longitude', result.longitude, { shouldValidate: true });
    // Also update pinPoint and serviceArea.location
    setValue('pinPoint', {
      type: 'Point',
      coordinates: [result.longitude, result.latitude],
    });
    setValue('serviceArea.location', {
      type: 'Point',
      coordinates: [result.longitude, result.latitude],
    });
  };

  const openMapPicker = () => {
    setMapPickerCallback(handleMapSelect);
    (navigation as any).navigate('MapPicker', {
      initialLat: addressLatitude,
      initialLng: addressLongitude,
    });
  };

  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="location" size={20} color="#2563eb" />
          <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Address
          </Text>
        </View>
        <TouchableOpacity
          onPress={openMapPicker}
          className="flex-row items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-4 py-2 dark:bg-slate-800"
        >
          <Ionicons name="map" size={18} color="#2563eb" />
          <Text className="text-sm font-semibold text-blue-600">
            Pick on map
          </Text>
        </TouchableOpacity>
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
