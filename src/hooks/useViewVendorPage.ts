import { useMemo, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVendor } from '@/hooks/api/useVendors';
import type { MainStackParamList } from '@/navigation/types';

type ViewVendorNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ViewVendor'
>;

export interface UseViewVendorPageReturn {
  // Data
  vendor: any | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Handlers
  handlePhonePress: (phone: string) => void;
  handleEmailPress: (email: string) => void;
  handleAddFollowUp: () => void;
}

export function useViewVendorPage(): UseViewVendorPageReturn {
  const route = useRoute();
  const navigation = useNavigation<ViewVendorNavigation>();
  const { id } = route.params as { id: string };
  const { data, isLoading, isError, error } = useVendor(id);

  // Extract vendor from API response
  const vendor = useMemo(() => {
    if (!data) return null;
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      const vendorData = data.data;
      if (
        vendorData &&
        typeof vendorData === 'object' &&
        vendorData !== null &&
        'name' in vendorData &&
        '_id' in vendorData
      ) {
        return vendorData;
      }
    }
    if (
      data &&
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      '_id' in data
    ) {
      if (!('status' in data && typeof (data as any).status === 'string')) {
        return data;
      }
    }
    return null;
  }, [data]);

  const handlePhonePress = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleEmailPress = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  const handleAddFollowUp = useCallback(() => {
    if (vendor?._id) {
      navigation.navigate('AddFollowUp', { vendorId: vendor._id });
    }
  }, [navigation, vendor?._id]);

  return {
    vendor,
    isLoading,
    isError,
    error,
    handlePhonePress,
    handleEmailPress,
    handleAddFollowUp,
  };
}
