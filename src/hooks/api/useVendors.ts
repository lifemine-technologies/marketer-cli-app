import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userAPI,
  type BasicReturnWithType,
  type BasicReturnType,
} from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';

export interface FollowUp {
  _id: string;
  date: string;
  note: string;
  Vendor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  status: string;
  priority?: string;
  source?: string;
  tags?: string[];
  servicePlaces: string[];
  address: {
    line1: string;
    line2?: string;
    code?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  pinPoint?: {
    type: string;
    coordinates: [number, number];
  };
  serviceSpeciality?: {
    speciality?: Array<{
      label: string;
      experience: number;
    }>;
    brands?: string[];
    servicesOffered?: string[];
  };
  serviceArea?: {
    location: {
      type: string;
      coordinates: [number, number];
    };
    radius: number;
  };
  isTechnicianAvailable?: boolean;
  noOfTechnicians?: number;
  followUps?: FollowUp[];
  timeSetUp?: { businessStartTime: number; businessEndTime: number };
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VendorListResponse {
  results: Vendor[];
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  totalDocs: number;
}

interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useVendors = (params: VendorListParams = {}) => {
  return useQuery({
    queryKey: [
      'vendors',
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
    ],
    queryFn: async () => {
      const response = await userAPI.get<
        BasicReturnWithType<VendorListResponse>
      >(API_ENDPOINTS.VENDOR.LIST, { params });
      return response.data;
    },
    placeholderData: previousData => previousData,
    retry: 1,
  });
};

export const useAllVendors = (params: VendorListParams = {}) => {
  return useQuery({
    queryKey: [
      'all-vendors',
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
    ],
    queryFn: async () => {
      const response = await userAPI.get<
        BasicReturnWithType<VendorListResponse>
      >(API_ENDPOINTS.ADMIN.VENDORS, { params });
      return response.data;
    },
    placeholderData: previousData => previousData,
    retry: 1,
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<Vendor>>(
        API_ENDPOINTS.VENDOR.VIEW(id),
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: previousData => previousData, // Keep showing previous data while refetching
  });
};

export const useAddVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const response = await userAPI.post<BasicReturnType>(
        API_ENDPOINTS.VENDOR.ADD,
        data,
      );
      return response.data;
    },
    onSuccess: data => {
      if (data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
        queryClient.invalidateQueries({ queryKey: ['all-vendors'] });
      }
    },
    onError: (error: unknown) => {
      console.error('Add vendor error:', error);
    },
  });
};

export interface AddFollowUpPayload {
  date: string;
  note: string;
}

export const useAddFollowUp = (vendorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddFollowUpPayload) => {
      const response = await userAPI.post<BasicReturnType>(
        API_ENDPOINTS.FOLLOWUP.ADD(vendorId),
        { date: new Date(payload.date).toISOString(), note: payload.note },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: unknown) => {
      console.error('Add follow-up error:', error);
    },
  });
};
