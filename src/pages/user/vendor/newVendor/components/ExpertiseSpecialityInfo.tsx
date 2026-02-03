import { View, Text, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';
import type { UseFieldArrayReturn } from 'react-hook-form';

interface ExpertiseSpecialityProps {
  brandInput: string;
  setBrandInput: (value: string) => void;
  serviceInput: string;
  setServiceInput: (value: string) => void;
  appendSpeciality: (value: { label: string; experience: number }) => void;
  removeSpeciality: (index: number) => void;
  specialityFields: UseFieldArrayReturn<VendorFormData, 'serviceSpeciality.speciality'>['fields'];
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
  brands: string[];
  servicesOffered: string[];
  addBrand: () => void;
  removeBrand: (index: number) => void;
  addService: () => void;
  removeService: (index: number) => void;
}

export const ExpertiseSpecialityInfo = ({
  brandInput,
  setBrandInput,
  serviceInput,
  setServiceInput,
  appendSpeciality,
  removeSpeciality,
  specialityFields,
  control,
  errors,
  brands,
  servicesOffered,
  addBrand,
  removeBrand,
  addService,
  removeService,
}: ExpertiseSpecialityProps) => {
  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="star" size={20} color="#2563eb" />
          <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Expertise & Speciality
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => appendSpeciality({ label: '', experience: 0 })}
          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5">
          <Text className="text-xs font-semibold text-white">Add</Text>
        </TouchableOpacity>
      </View>

      {specialityFields.map((field, index) => (
        <View
          key={field.id}
          className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <View className="mb-2 flex-row gap-2">
            <View className="flex-1">
              <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-slate-300">
                Speciality Name
              </Text>
              <Controller
                control={control}
                name={`serviceSpeciality.speciality.${index}.label`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Plumbing"
                    error={errors.serviceSpeciality?.speciality?.[index]?.label?.message}
                  />
                )}
              />
            </View>
            <View className="w-24">
              <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-slate-300">
                Years
              </Text>
              <Controller
                control={control}
                name={`serviceSpeciality.speciality.${index}.experience`}
                render={({ field: { value, onChange } }) => (
                  <Input
                    value={value?.toString() ?? '0'}
                    onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                    error={errors.serviceSpeciality?.speciality?.[index]?.experience?.message}
                  />
                )}
              />
            </View>
            <TouchableOpacity
              onPress={() => removeSpeciality(index)}
              className="mt-6 h-12 w-12 items-center justify-center">
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View className="space-y-3">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Supported Brands
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={brandInput}
                onChangeText={setBrandInput}
                placeholder="Enter brand name"
              />
            </View>
            <TouchableOpacity
              onPress={addBrand}
              className="justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-3">
              <Text className="text-xs font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
          {brands.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {brands.map((brand, i) => (
                <View key={i} className="flex-row items-center">
                  <Badge variant="secondary" className="px-3 py-1">
                    {brand}
                  </Badge>
                  <TouchableOpacity onPress={() => removeBrand(i)} className="ml-1">
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Services Offered
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={serviceInput}
                onChangeText={setServiceInput}
                placeholder="Enter service name"
              />
            </View>
            <TouchableOpacity
              onPress={addService}
              className="justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-3">
              <Text className="text-xs font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
          {servicesOffered.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {servicesOffered.map((service, i) => (
                <View key={i} className="flex-row items-center">
                  <Badge variant="secondary" className="px-3 py-1">
                    {service}
                  </Badge>
                  <TouchableOpacity onPress={() => removeService(i)} className="ml-1">
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
