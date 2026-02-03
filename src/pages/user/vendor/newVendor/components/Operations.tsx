import { View, Text, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from '@/components/ui/Badge';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors } from 'react-hook-form';

interface OperationsProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
  tagInput: string;
  setTagInput: (value: string) => void;
  tags: string[];
  addTag: () => void;
  removeTag: (index: number) => void;
}

export const Operations = ({
  control,
  errors,
  tagInput,
  setTagInput,
  tags,
  addTag,
  removeTag,
}: OperationsProps) => {
  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="settings" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">Operations</Text>
      </View>

      <View className="space-y-4">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Number of Technicians
          </Text>
          <Controller
            control={control}
            name="noOfTechnicians"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value?.toString() ?? '0'}
                onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
                placeholder="0"
                keyboardType="numeric"
                error={errors.noOfTechnicians?.message}
              />
            )}
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Business Start Time (24h)
            </Text>
            <Controller
              control={control}
              name="timeSetUp.businessStartTime"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value?.toString() ?? ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  placeholder="9.0"
                  keyboardType="numeric"
                  error={errors.timeSetUp?.businessStartTime?.message}
                />
              )}
            />
          </View>
          <View className="flex-1 space-y-1.5">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Business End Time (24h)
            </Text>
            <Controller
              control={control}
              name="timeSetUp.businessEndTime"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value?.toString() ?? ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  placeholder="18.0"
                  keyboardType="numeric"
                  error={errors.timeSetUp?.businessEndTime?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Search Tags
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Press Enter to add tag"
              />
            </View>
            <TouchableOpacity
              onPress={addTag}
              className="justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-3">
              <Text className="text-xs font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {tags.map((tag, i) => (
                <View key={i} className="flex-row items-center">
                  <Badge variant="secondary" className="px-3 py-1">
                    {tag}
                  </Badge>
                  <TouchableOpacity onPress={() => removeTag(i)} className="ml-1">
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Internal Notes
          </Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange } }) => (
              <Input
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="Background info..."
                multiline
                numberOfLines={4}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};
