import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, type BasicReturnWithType, type BasicReturnType } from "@/config/axios";
import { API_ENDPOINTS } from "@/config/url";

export interface Marketer {
  _id: string;
  identifier: string;
  name?: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  createdByDetails?: {
    _id: string;
    name?: string;
    role: string;
  };
}

// Get all marketers
export const useMarketers = () => {
  return useQuery({
    queryKey: ["marketers"],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<Marketer[]>>(
        API_ENDPOINTS.MARKETER.LIST
      );
      return response.data;
    },
    retry: 1,
  });
};

// Get single marketer
export const useMarketer = (id: string) => {
  return useQuery({
    queryKey: ["marketer", id],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<Marketer>>(
        API_ENDPOINTS.MARKETER.VIEW(id)
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });
};

// Add new marketer
export interface AddMarketerData {
  name: string;
  phone: string;
  password: string;
  role: "MANAGER" | "COORDINATOR" | "TELECALLER";
}

export const useAddMarketer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMarketerData) => {
      const response = await userAPI.post<BasicReturnType>(
        API_ENDPOINTS.MARKETER.ADD,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        // Invalidate marketers list to refetch
        queryClient.invalidateQueries({ queryKey: ["marketers"] });
      }
    },
    onError: (error: any) => {
      console.error("Add marketer error:", error);
      // Error will be handled by the component using Alert
    },
  });
};

// Update marketer details
export interface UpdateMarketerData {
  name?: string;
  password?: string;
  status?: string;
}

export const useUpdateMarketer = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMarketerData) => {
      const response = await userAPI.post<BasicReturnWithType<any>>(
        API_ENDPOINTS.MANAGER.DetailsUpdate(id),
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["marketer", id] });
        queryClient.invalidateQueries({ queryKey: ["marketers"] });
      }
    },
    onError: (error: any) => {
      console.error("Update marketer error:", error);
      // Error will be handled by the component using Alert
    },
  });
};
