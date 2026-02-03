import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Input } from '@/components/ui/Input';

interface ServiceDetailsInfoProps {
  servicePlacesInput: string;
  setServicePlacesInput: (value: string) => void;
}

export const AddressDetailsInfo = ({
  servicePlacesInput,
  setServicePlacesInput,
}: ServiceDetailsInfoProps) => {
  return (
    <View className="mb-2 space-y-4 pt-2">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="briefcase" size={20} color="#2563eb" />
        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">Service Details</Text>
      </View>

      <View className="space-y-3">
        <View className="space-y-1.5">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Service Places
          </Text>
          <Input
            value={servicePlacesInput}
            onChangeText={setServicePlacesInput}
            placeholder="Enter service places (comma separated)"
          />
          <Text className="text-xs text-gray-500 dark:text-slate-400">
            Separate multiple places with commas
          </Text>
        </View>
      </View>
    </View>
  );
};
