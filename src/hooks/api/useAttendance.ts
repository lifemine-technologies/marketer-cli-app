import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, type BasicReturnWithType } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';
import {
  startBackgroundLocationTracking,
  startForegroundLocationTracking,
  stopBackgroundLocationTracking,
  stopForegroundLocationTracking,
} from '@/services/locationTracking';

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
      userAPI.post<BasicReturnWithType<any>>(
        API_ENDPOINTS.MARKETER.ATTENDANCE.PUNCH_IN,
        payload,
      ),
    onSuccess: async response => {
      if (response.data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
        // Start background location tracking
        const started = await startBackgroundLocationTracking();
        if (!started) {
          console.warn(
            'Background location could not start. Keep app open and try again.',
          );
        }
        // Start high-frequency foreground tracking (JS)
        await startForegroundLocationTracking();
      }
    },
    onError: (error: any) => {
      console.error('Punch in error:', error);
    },
  });

  const punchOutMutation = useMutation({
    mutationFn: (payload: Payload) =>
      userAPI.post<BasicReturnWithType<any>>(
        API_ENDPOINTS.MARKETER.ATTENDANCE.PUNCH_OUT,
        payload,
      ),
    onSuccess: async response => {
      if (response.data.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
        // Stop background location tracking
        await stopBackgroundLocationTracking();
        // Stop foreground tracking (JS)
        stopForegroundLocationTracking();
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
