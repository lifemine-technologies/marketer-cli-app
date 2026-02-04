import { useContext, useState, useMemo, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
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

// Request location permission for Android
const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location for attendance tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permissions are handled automatically
};

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
  isPunchPending: boolean;
  handlePunch: () => Promise<void>;

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
  const mutation = isActive ? punchOutMutation : punchInMutation;

  // Fetch data for dynamic stats - use minimal queries just for counts
  const vendorsQuery = isAdmin
    ? useAllVendors({ page: 1, limit: 1 }) // Just get count
    : useVendors({ page: 1, limit: 1 }); // Just get count

  const marketersQuery = useMarketers();
  const { data: todaysFollowUps = [], isLoading: isLoadingFollowUps } =
    useTodaysFollowUps();

  // Calculate dynamic stats
  const stats = useMemo(() => {
    // API returns: { status: 'success', data: VendorListResponse }
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

  const handlePunch = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for attendance.',
        );
        setIsGettingLocation(false);
        return;
      }

      // Check if location services are enabled (Android)
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
        } catch (err) {
          // Continue anyway
        }
      }

      // Get current location with longer timeout and better options
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
                    response.data.message ||
                      `${isActive ? 'Punched out' : 'Punched in'} successfully!`,
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
          enableHighAccuracy: false, // Use false for faster response
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 60000, // Accept location up to 1 minute old
        },
      );
    } catch (error: any) {
      setIsGettingLocation(false);
      console.error('Error in handlePunch:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please ensure location services are enabled and try again.',
      );
    }
  }, [mutation, isActive]);

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
    isPunchPending: mutation.isPending,
    handlePunch,
    stats,
    todaysFollowUps,
    isLoadingFollowUps,
    filteredActions,
    handleLogout,
    navigateToScreen,
  };
}
