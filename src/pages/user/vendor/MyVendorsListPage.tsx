import React, { useState, useMemo, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useVendors, useAllVendors } from '@/hooks/api/useVendors';
import { UserProviderContext } from '@/utils/contexts/authUserContext';

export const MyVendorsListPage = ({ is }: { is?: 'ADMIN' | 'VENDOR' }) => {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const userRole = user?.role || 'COORDINATOR';
  // Determine if this is admin view - either passed as prop or check user role
  const isAdminView = is === 'ADMIN' || (is === undefined && userRole === 'ADMIN');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Use different hooks based on admin view
  const vendorsQuery = isAdminView
    ? useAllVendors({
        page,
        limit: 10,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    : useVendors({
        page,
        limit: 10,
        search: searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

  const { data, isLoading, isError, error, refetch } = vendorsQuery;

  const vendors = useMemo(() => {
    // API returns: { status: 'success', data: VendorListResponse }
    // So we need: data.data.results
    if (__DEV__) {
      console.log('Vendors Query Data:', JSON.stringify(data, null, 2));
    }
    if (!data?.data?.results) {
      if (__DEV__) {
        console.log('No vendors found. Data structure:', {
          hasData: !!data,
          hasDataData: !!data?.data,
          hasResults: !!data?.data?.results,
          dataStatus: data?.status,
        });
      }
      return [];
    }
    return data.data.results;
  }, [data]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        refetch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, refetch]);

  const hasPrevPage = page > 1;
  const hasNextPage = data?.data?.page < data?.data?.totalPages;

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-slate-900">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-center text-base font-semibold text-red-600 dark:text-red-400">
          Error loading vendors
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-3">
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      {/* Header with Search and Add Button */}
      <View className="bg-blue-600 px-5 pb-6 pt-14 dark:bg-blue-700">
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="mb-1 text-2xl font-bold text-white">
              {isAdminView ? 'All Vendors' : 'My Vendors'}
            </Text>
            <Text className="text-sm text-blue-100">
              {isAdminView ? 'View all vendors and their details' : 'Manage your vendor list'}
            </Text>
          </View>
          {!isAdminView && (
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore
                navigation.navigate('NewVendor');
              }}
              className="flex-row items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 shadow-lg active:scale-95 active:opacity-90">
              <Ionicons name="add-outline" size={18} color="#2563eb" />
              <Text className="text-sm font-semibold text-blue-600">Add</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="relative">
          <View className="absolute left-3 top-3.5 z-10">
            <Ionicons name="search-outline" size={20} color="#9ca3af" />
          </View>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search vendors..."
            className="bg-white pl-10 dark:bg-slate-700"
          />
        </View>
      </View>

      {/* Mobile-friendly Card List */}
      <View className="-mt-4 px-4 pb-6">
        {isLoading && vendors.length === 0 ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-center text-gray-600 dark:text-slate-400">
              Loading vendors...
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor._id}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('ViewVendor', { id: vendor._id });
                }}
                className="mb-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-[0.98] active:opacity-80 dark:border-slate-700 dark:bg-slate-800">
                <View className="mb-4 flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <View className="mb-2 flex-row items-center gap-2">
                      <View className="h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/30">
                        <Ionicons name="storefront-outline" size={20} color="#2563eb" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
                          {vendor.name}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-slate-900/50">
                      <Ionicons name="call-outline" size={14} color="#2563eb" />
                      <Text className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {vendor.phone}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end gap-1">
                    <Badge
                      className={
                        vendor.status === 'NEW'
                          ? 'bg-green-500 dark:bg-green-600'
                          : 'bg-blue-500 dark:bg-blue-600'
                      }>
                      {vendor.status}
                    </Badge>

                    <Text
                      className={`text-[10px] font-bold ${
                        vendor.priority === 'HIGH'
                          ? 'text-red-600'
                          : vendor.priority === 'MEDIUM'
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                      }`}>
                      {vendor.priority} PRIORITY
                    </Text>
                  </View>
                </View>

                <View className="space-y-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                  <View className="flex-row items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-900/20">
                    <Ionicons name="location-outline" size={16} color="#2563eb" style={{ marginTop: 1 }} />
                    <Text className="flex-1 text-xs leading-4 text-gray-700 dark:text-slate-300">
                      {vendor.address?.line1 || 'Address not available'}
                    </Text>
                  </View>

                  {vendor.servicePlaces?.length > 0 && (
                    <View className="mt-2 flex-row flex-wrap items-center gap-2">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="globe-outline" size={12} color="#6b7280" />
                        <Text className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Places:
                        </Text>
                      </View>

                      {vendor.servicePlaces.slice(0, 3).map((place) => (
                        <View
                          key={place}
                          className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 dark:border-slate-600 dark:bg-slate-700">
                          <Text className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            {place}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {vendor.serviceSpeciality?.brands?.length > 0 && (
                    <View className="mt-2 flex-row flex-wrap items-center gap-2">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="pricetag-outline" size={12} color="#6b7280" />
                        <Text className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Brands:
                        </Text>
                      </View>

                      {vendor.serviceSpeciality.brands.slice(0, 3).map((brand) => (
                        <View
                          key={brand}
                          className="rounded-lg border border-blue-300 bg-blue-100 px-3 py-1.5 dark:border-blue-700/50 dark:bg-blue-900/40">
                          <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                            {brand}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isLoading && vendors.length === 0 && (
          <View className="items-center justify-center py-16">
            <Ionicons name="search-outline" size={48} color="#9ca3af" />
            <Text className="mt-4 text-center text-base text-gray-500 dark:text-slate-400">
              No vendors found
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400 dark:text-slate-500">
              {searchQuery
                ? 'Try adjusting your search'
                : isAdminView
                  ? 'No vendors available'
                  : 'Add your first vendor to get started'}
            </Text>
          </View>
        )}

        {/* Pagination Controls */}
        {data?.data?.totalPages > 1 && (
          <View className="mt-6 flex-row items-center justify-between rounded-xl bg-white px-4 py-3 shadow-md dark:bg-slate-800">
            {/* Previous */}
            <TouchableOpacity
              disabled={!hasPrevPage || isLoading}
              onPress={() => hasPrevPage && setPage((p) => p - 1)}
              className={`flex-row items-center gap-1 rounded-lg px-3 py-2 ${
                hasPrevPage ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}>
              <Ionicons name="chevron-back-outline" size={18} color={hasPrevPage ? '#ffffff' : '#9ca3af'} />
              <Text
                className={`text-sm font-semibold ${hasPrevPage ? 'text-white' : 'text-gray-400'}`}>
                Prev
              </Text>
            </TouchableOpacity>

            {/* Page Info */}
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Page {page} of {data?.data?.totalPages}
            </Text>

            {/* Next */}
            <TouchableOpacity
              disabled={!hasNextPage || isLoading}
              onPress={() => hasNextPage && setPage((p) => p + 1)}
              className={`flex-row items-center gap-1 rounded-lg px-3 py-2 ${
                hasNextPage ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
              }`}>
              <Text
                className={`text-sm font-semibold ${hasNextPage ? 'text-white' : 'text-gray-400'}`}>
                Next
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={hasNextPage ? '#ffffff' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
