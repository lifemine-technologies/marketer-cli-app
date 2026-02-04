import { useState, useMemo, useContext, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useMarketers } from '@/hooks/api/useMarketers';
import { UserProviderContext } from '@/utils/contexts/authUserContext';

const ITEMS_PER_PAGE = 5;

export interface UseAllMarketersPageReturn {
  // Data
  paginatedMarketers: Marketer[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  handleNextPage: () => void;
  handlePrevPage: () => void;

  // User permissions
  canAddMarketer: boolean;

  // Handlers
  handleAddMarketer: () => void;
  handleViewMarketer: (id: string) => void;
}

export function useAllMarketersPage(): UseAllMarketersPageReturn {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const userRole = user?.role;
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const canAddMarketer = isAdmin || isManager;

  const [searchQuery, setSearchQueryState] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
        marketer.identifier.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMarketers.length / ITEMS_PER_PAGE);
  const paginatedMarketers = filteredMarketers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1); // reset to first page when search changes
  }, []);

  const handleAddMarketer = useCallback(() => {
    // @ts-ignore
    navigation.navigate('AddMarketer');
  }, [navigation]);

  const handleViewMarketer = useCallback(
    (id: string) => {
      // @ts-ignore
      navigation.navigate('ViewMarketer', { id });
    },
    [navigation],
  );

  return {
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
  };
}
