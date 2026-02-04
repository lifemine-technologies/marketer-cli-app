import React from 'react';
import { View, ScrollView } from 'react-native';
import { RoleGuard } from '@/components/RoleGuard';
import { useAllMarketersPage } from '@/hooks/useAllMarketersPage';
import {
  MarketersHeader,
  MarketerCard,
  PaginationControls,
  ErrorState,
  LoadingState,
  EmptyState,
} from './components';

function AllMarketersPageContent() {
  const {
    paginatedMarketers,
    isLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    handleNextPage,
    handlePrevPage,
    canAddMarketer,
    handleAddMarketer,
    handleViewMarketer,
  } = useAllMarketersPage();

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const showLoading = isLoading && paginatedMarketers.length === 0;
  const showEmpty = !isLoading && paginatedMarketers.length === 0;

  return (
    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <MarketersHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          canAddMarketer={canAddMarketer}
          onAddPress={handleAddMarketer}
        />

        <View className="-mt-4 px-4 pb-6">
          {showLoading ? (
            <LoadingState />
          ) : (
            <View className="space-y-4">
              {paginatedMarketers.map(marketer => (
                <MarketerCard
                  key={marketer._id}
                  marketer={marketer}
                  onPress={() => handleViewMarketer(marketer._id)}
                />
              ))}
            </View>
          )}

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />

          {showEmpty && <EmptyState hasSearchQuery={!!searchQuery} />}
        </View>
      </ScrollView>
    </RoleGuard>
  );
}

export const AllMarketersPage = () => <AllMarketersPageContent />;
