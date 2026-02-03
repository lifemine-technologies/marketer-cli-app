import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, type BasicReturnWithType, type BasicReturnType } from "@/config/axios";
import { API_ENDPOINTS } from "@/config/url";

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
  status: string;
  priority?: string;
  servicePlaces: string[];
  address: { line1: string; line2?: string; code?: string };
  serviceSpeciality: { brands: string[] };
  followUps?: FollowUp[];
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
  sortOrder?: "asc" | "desc";
}

// Get vendors list (for regular users)
export const useVendors = (params: VendorListParams = {}) => {
  return useQuery({
    queryKey: ["vendors", params.page, params.limit, params.search, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<VendorListResponse>>(
        API_ENDPOINTS.VENDOR.LIST,
        { params }
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

// Get all vendors (for ADMIN)
export const useAllVendors = (params: VendorListParams = {}) => {
  return useQuery({
    queryKey: ["all-vendors", params.page, params.limit, params.search, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<VendorListResponse>>(
        API_ENDPOINTS.ADMIN.VENDORS,
        { params }
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

// Get single vendor
export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<Vendor>>(
        API_ENDPOINTS.VENDOR.VIEW(id)
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });
};

// Add new vendor
export const useAddVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const response = await userAPI.post<BasicReturnType>(
        API_ENDPOINTS.VENDOR.ADD,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        // Invalidate vendors list to refetch
        queryClient.invalidateQueries({ queryKey: ["vendors"] });
        queryClient.invalidateQueries({ queryKey: ["all-vendors"] });
      }
    },
    onError: (error: any) => {
      console.error("Add vendor error:", error);
      // Error will be handled by the component using Alert
    },
  });
};
