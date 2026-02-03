import React, { useState, useMemo, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMarketers } from '@/hooks/api/useMarketers';
import { UserProviderContext } from '@/utils/contexts/authUserContext';
import { RoleGuard } from '@/components/RoleGuard';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const AllMarketersPage = () => {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const userRole = user?.role;
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const canAddMarketer = isAdmin || isManager;
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // show 5 marketers per page

  const { data, isLoading, isError, error, refetch } = useMarketers();

  // Filter marketers based on search
  const filteredMarketers = useMemo(() => {
    if (!data?.data) return [];
    const marketers = data.data;
    if (!searchQuery) return marketers;
    return marketers.filter(
      (marketer) =>
        marketer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marketer.phone.includes(searchQuery) ||
        marketer.identifier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMarketers.length / itemsPerPage);
  const paginatedMarketers = filteredMarketers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-slate-900">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-center text-base font-semibold text-red-600 dark:text-red-400">
          Error loading coordinators
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
    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
        {/* Header with Search */}
        <View className="bg-blue-600 px-5 pb-6 pt-14 dark:bg-blue-700">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-2xl font-bold text-white">Coordinators</Text>
              <Text className="text-sm text-blue-100">View all coordinators</Text>
            </View>
            {canAddMarketer && (
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('AddMarketer');
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
              onChangeText={(text) => {
                setSearchQuery(text);
                setCurrentPage(1); // reset to first page when search changes
              }}
              placeholder="Search Coordinators..."
              className="bg-white pl-10 dark:bg-slate-700"
            />
          </View>
        </View>

        {/* Card List */}
        <View className="-mt-4 px-4 pb-6">
          {isLoading && filteredMarketers.length === 0 ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-4 text-center text-gray-600 dark:text-slate-400">
                Loading coordinators...
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {paginatedMarketers.map((marketer) => (
                <TouchableOpacity
                  key={marketer._id}
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('ViewMarketer', { id: marketer._id });
                  }}
                  className="mb-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-[0.98] active:opacity-80 dark:border-slate-700 dark:bg-slate-800">
                  <View className="mb-4 flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <View className="mb-2 flex-row items-center gap-2">
                        <View className="h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/30">
                          <Ionicons name="person-outline" size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
                            {marketer.name || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-slate-900/50">
                        <Ionicons name="call-outline" size={14} color="#2563eb" />
                        <Text className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {marketer.phone}
                        </Text>
                      </View>
                    </View>
                    <Badge variant="default">{marketer.role}</Badge>
                  </View>

                  <View className="space-y-3 border-t border-gray-100 pt-4 dark:border-slate-700">
                    <View className="flex-row items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-900/50">
                      <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 dark:text-slate-500">
                          Created by
                        </Text>
                        <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          {marketer.createdByDetails?.name || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-2 flex-row items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-800/30 dark:bg-blue-900/20">
                      <Ionicons name="calendar-outline" size={14} color="#2563eb" />
                      <Text className="text-xs font-medium text-gray-700 dark:text-slate-300">
                        {formatDate(marketer.createdAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View className="mt-6 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={handlePrevPage}
                className={`rounded-lg px-4 py-2 ${
                  currentPage === 1 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600'
                }`}>
                <Text className="text-white">Previous</Text>
              </TouchableOpacity>
              <Text className="text-gray-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                disabled={currentPage === totalPages}
                onPress={handleNextPage}
                className={`rounded-lg px-4 py-2 ${
                  currentPage === totalPages ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600'
                }`}>
                <Text className="text-white">Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && filteredMarketers.length === 0 && (
            <View className="items-center justify-center py-16">
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text className="mt-4 text-center text-base text-gray-500 dark:text-slate-400">
                No coordinators found
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-400 dark:text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'No coordinators available'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </RoleGuard>
  );
};
