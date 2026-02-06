import { useContext, useState, useMemo, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  UserProviderContext,
  AuthUserContext,
} from '@/utils/contexts/authUserContext';
import { useAttendance } from '@/hooks/api/useAttendance';
import { useTodaysFollowUps } from '@/hooks/api/useFollowUpCalendar';
import { useVendors, useAllVendors } from '@/hooks/api/useVendors';
import { useMarketers } from '@/hooks/api/useMarketers';
import { quickActions } from '@/pages/user/dashboard/constants';
import { requestLocationPermissions } from '@/services/locationTracking';

export interface UseDashboardPageReturn {
  // User info
  userRole: string | undefined;
  userPhone: string | undefined;
  isAdmin: boolean;
  isManager: boolean;
  canViewCoordinators: boolean;

  // Attendance
  attendance: any;
  isActive: boolean;
  isGettingLocation: boolean;
  isPunchInPending: boolean;
  isPunchOutPending: boolean;
  handlePunchIn: () => Promise<void>;
  handlePunchOut: () => Promise<void>;

  // Stats
  stats: Array<{
    label: string;
    value: string;
    icon: 'storefront' | 'people';
  }>;

  // Follow-ups
  todaysFollowUps: any[];
  isLoadingFollowUps: boolean;

  // Quick actions
  filteredActions: typeof quickActions;

  // Handlers
  handleLogout: () => void;
  navigateToScreen: (screen: string, params?: object) => void;
}

export function useDashboardPage(): UseDashboardPageReturn {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const authContext = useContext(AuthUserContext);
  const userRole = user?.role;
  const userPhone = user?.phone;
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const canViewCoordinators = isAdmin || isManager;

  const { punchInMutation, punchOutMutation } = useAttendance();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const attendance = user?.attendance;
  const isActive = attendance?.isActive || false;

  // Fetch data for dynamic stats - use minimal queries just for counts
  const vendorsQuery = isAdmin
    ? useAllVendors({ page: 1, limit: 1 }) // Just get count
    : useVendors({ page: 1, limit: 1 }); // Just get count

  const marketersQuery = useMarketers();
  const { data: todaysFollowUps = [], isLoading: isLoadingFollowUps } =
    useTodaysFollowUps();

  const stats = useMemo(() => {
    const vendorCount = vendorsQuery.data?.data?.totalDocs || 0;
    const coordinatorCount = canViewCoordinators
      ? marketersQuery.data?.data?.length || 0
      : 0;

    const statsArray = [
      {
        label: isAdmin ? 'Total Vendors' : 'My Vendors',
        value: vendorCount.toString(),
        icon: 'storefront' as const,
      },
    ];

    // Only show coordinators stat if user can view coordinators
    if (canViewCoordinators) {
      statsArray.push({
        label: 'Active Coordinators',
        value: coordinatorCount.toString(),
        icon: 'people' as const,
      });
    }

    return statsArray;
  }, [vendorsQuery.data, marketersQuery.data, isAdmin, canViewCoordinators]);

  const filteredActions = useMemo(
    () =>
      quickActions.filter(
        action =>
          action.role === 'ALL' ||
          (Array.isArray(action.role) && action.role.includes(userRole)),
      ),
    [userRole],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            authContext?.logout?.();
          },
        },
      ],
      { cancelable: true },
    );
  }, [authContext]);

  const runPunchWithLocation = useCallback(
    (
      mutation: typeof punchInMutation | typeof punchOutMutation,
      actionLabel: 'Punched in' | 'Punched out',
    ) => {
      Geolocation.getCurrentPosition(
        position => {
          const coordinates: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          mutation.mutate(
            { location: { type: 'Point', coordinates } },
            {
              onSuccess: response => {
                setIsGettingLocation(false);
                if (response.data.status === 'success') {
                  Alert.alert(
                    'Success',
                    response.data.message || `${actionLabel} successfully!`,
                  );
                } else {
                  Alert.alert(
                    'Error',
                    response.data.message || 'Failed to update attendance.',
                  );
                }
              },
              onError: (error: any) => {
                setIsGettingLocation(false);
                const errorMessage =
                  error?.response?.data?.message ||
                  error?.message ||
                  'Failed to update attendance.';
                Alert.alert('Error', errorMessage);
              },
            },
          );
        },
        error => {
          setIsGettingLocation(false);
          console.error('Error getting location:', error);
          let errorMessage = 'Failed to get your location. ';
          if (error.code === 1) {
            errorMessage +=
              'Permission denied. Please grant location permission.';
          } else if (error.code === 2) {
            errorMessage +=
              'Location unavailable. Please check your GPS settings.';
          } else if (error.code === 3) {
            errorMessage +=
              'Location request timed out. Please try again in a better location.';
          } else {
            errorMessage += 'Please ensure location services are enabled.';
          }
          Alert.alert('Location Error', errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000,
        },
      );
    },
    [],
  );

  const handlePunchIn = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      const { foreground, background } = await requestLocationPermissions();
      if (!foreground) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for attendance.',
        );
        setIsGettingLocation(false);
        return;
      }
      // On Android 10+, require background location to punch in (for tracking while working)
      if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 29 && !background) {
        Alert.alert(
          'Background Location Required',
          'Please grant "Allow all the time" (background) location permission to punch in. Your location is tracked while you are working.',
        );
        setIsGettingLocation(false);
        return;
      }
      if (Platform.OS === 'android') {
        try {
          const enabled = await new Promise<boolean>(resolve => {
            Geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false),
              { timeout: 1000, maximumAge: Infinity },
            );
          });
          if (!enabled) {
            Alert.alert(
              'Location Services Disabled',
              'Please enable location services in your device settings.',
            );
            setIsGettingLocation(false);
            return;
          }
        } catch {
          // Continue anyway
        }
      }
      runPunchWithLocation(punchInMutation, 'Punched in');
    } catch (error: any) {
      setIsGettingLocation(false);
      console.error('Error in handlePunchIn:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please ensure location services are enabled and try again.',
      );
    }
  }, [punchInMutation, runPunchWithLocation]);

  const handlePunchOut = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      const { foreground } = await requestLocationPermissions();
      if (!foreground) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for attendance.',
        );
        setIsGettingLocation(false);
        return;
      }
      if (Platform.OS === 'android') {
        try {
          const enabled = await new Promise<boolean>(resolve => {
            Geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false),
              { timeout: 1000, maximumAge: Infinity },
            );
          });
          if (!enabled) {
            Alert.alert(
              'Location Services Disabled',
              'Please enable location services in your device settings.',
            );
            setIsGettingLocation(false);
            return;
          }
        } catch {
          // Continue anyway
        }
      }
      runPunchWithLocation(punchOutMutation, 'Punched out');
    } catch (error: any) {
      setIsGettingLocation(false);
      console.error('Error in handlePunchOut:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please ensure location services are enabled and try again.',
      );
    }
  }, [punchOutMutation, runPunchWithLocation]);

  const navigateToScreen = useCallback(
    (screen: string, params?: object) => {
      // @ts-ignore
      navigation.navigate(screen, params);
    },
    [navigation],
  );

  return {
    userRole,
    userPhone,
    isAdmin,
    isManager,
    canViewCoordinators,
    attendance,
    isActive,
    isGettingLocation,
    isPunchInPending: punchInMutation.isPending,
    isPunchOutPending: punchOutMutation.isPending,
    handlePunchIn,
    handlePunchOut,
    stats,
    todaysFollowUps,
    isLoadingFollowUps,
    filteredActions,
    handleLogout,
    navigateToScreen,
  };
}
