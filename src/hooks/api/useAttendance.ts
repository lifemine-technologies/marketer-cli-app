import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, type BasicReturnWithType } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';

type Payload = {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export const useAttendance = () => {
  const queryClient = useQueryClient();

  const punchInMutation = useMutation({
    mutationFn: (payload: Payload) =>
      userAPI.post<BasicReturnWithType<any>>(API_ENDPOINTS.MARKETER.ATTENDANCE.PUNCH_IN, payload),
    onSuccess: async (response) => {
      if (response.data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
        // Note: Background location tracking would be implemented here for React Native CLI
        // For now, we'll skip it as it requires additional setup
      }
    },
    onError: (error: any) => {
      console.error('Punch in error:', error);
    },
  });

  const punchOutMutation = useMutation({
    mutationFn: (payload: Payload) =>
      userAPI.post<BasicReturnWithType<any>>(API_ENDPOINTS.MARKETER.ATTENDANCE.PUNCH_OUT, payload),
    onSuccess: async (response) => {
      if (response.data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
        // Note: Stop background location tracking would be implemented here
      }
    },
    onError: (error: any) => {
      console.error('Punch out error:', error);
    },
  });

  return {
    punchInMutation,
    punchOutMutation,
  };
};
