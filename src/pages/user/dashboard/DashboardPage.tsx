import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  UserProviderContext,
  AuthUserContext,
} from '../../../utils/contexts/authUserContext';
import { useAttendance } from '@/hooks/api/useAttendance';
import { useTodaysFollowUps } from '@/hooks/api/useFollowUpCalendar';
import Geolocation from '@react-native-community/geolocation';
import { useVendors, useAllVendors } from '@/hooks/api/useVendors';
import { useMarketers } from '@/hooks/api/useMarketers';
import { AppIcon } from '@/components/AppIcon';
import { Platform, PermissionsAndroid } from 'react-native';

const quickActions = [
  {
    title: 'Add New Vendor',
    screen: 'NewVendor',
    icon: 'add-circle' as const,
    color: 'bg-blue-600',
    role: 'ALL' as const,
  },
  {
    title: 'All Vendors',
    screen: 'AllVendors',
    icon: 'list' as const,
    color: 'bg-blue-600',
    role: ['ADMIN'] as const,
  },
  {
    title: 'Add Coordinator',
    screen: 'AddMarketer',
    icon: 'person-add' as const,
    color: 'bg-blue-600',
    role: ['ADMIN', 'MANAGER'] as const,
  },
];

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

export const DashboardPage = () => {
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

  const filteredActions = quickActions.filter(
    action =>
      action.role === 'ALL' ||
      (Array.isArray(action.role) && action.role.includes(userRole)),
  );

  const handleLogout = () => {
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
  };

  const handlePunch = async () => {
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
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <View className="bg-blue-600 px-5 pb-8 pt-16 dark:bg-blue-700">
        <View className="flex-row items-center justify-between">
          {/* LEFT SIDE: Logo + Text */}
          <View className="flex-row items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white p-2">
              <AppIcon width={40} height={40} color="#2563eb" />
            </View>

            <View>
              <Text className="text-xl font-bold text-white">
                Fatafat Service
              </Text>
              <Text className="text-sm text-blue-100">{userRole}</Text>
              <Text className="text-xs text-blue-200">{userPhone}</Text>
            </View>
          </View>

          {/* RIGHT SIDE: Actions */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleLogout}
              className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 active:opacity-70"
            >
              <Ionicons name="log-out-outline" size={22} color="#ffffff" />
            </TouchableOpacity>

            <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/25">
              <Ionicons name="person-outline" size={28} color="#ffffff" />
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pb-6">
        {/* Attendance Card - Only for non-ADMIN users */}
        {!isAdmin && (
          <Card className="-mt-6 mb-6">
            <View className="p-5">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-slate-100">
                    Attendance
                  </Text>
                  {attendance?.punchInTime && (
                    <Text className="text-sm text-gray-600 dark:text-slate-400">
                      {isActive ? 'Punched in' : 'Punched out'} -{' '}
                      {new Date(
                        isActive
                          ? attendance.punchInTime
                          : attendance.punchOutTime || '',
                      ).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handlePunch}
                  disabled={isGettingLocation || mutation.isPending}
                  className={`${
                    isActive ? 'bg-red-600' : 'bg-green-600'
                  } flex-row items-center gap-2 rounded-xl px-6 py-3 shadow-lg active:opacity-80`}
                >
                  {isGettingLocation || mutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name={isActive ? 'log-out-outline' : 'log-in-outline'}
                        size={20}
                        color="#ffffff"
                      />
                      <Text className="font-semibold text-white">
                        {isActive ? 'Punch Out' : 'Punch In'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Stats Cards - Dynamic based on role and data */}
        <View className="mb-6 flex-row flex-wrap gap-4">
          {stats.map((stat, index) => {
            // Map stat to Tab route names
            let targetScreen: string | undefined;
            if (stat.label.includes('Vendors')) targetScreen = 'Vendors';
            if (stat.label.includes('Coordinators'))
              targetScreen = 'Coordinators';

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (targetScreen) {
                    // @ts-ignore
                    navigation.navigate(targetScreen);
                  }
                }}
                className="min-w-[30%] flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-95 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
              >
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/30">
                  <Ionicons name={stat.icon} size={24} color="#2563eb" />
                </View>
                <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {stat.value}
                </Text>
                <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
                  {stat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Today's Follow-ups */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Today's Follow-ups
            </Text>
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore - switch to Calendar tab
                navigation.navigate('Calendar');
              }}
              className="rounded-lg px-3 py-1.5 active:opacity-70"
            >
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                View Calendar
              </Text>
            </TouchableOpacity>
          </View>
          <Card className="overflow-hidden">
            {isLoadingFollowUps ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="small" color="#2563eb" />
                <Text className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Loading follow-ups...
                </Text>
              </View>
            ) : todaysFollowUps.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Ionicons
                  name="calendar-outline"
                  size={40}
                  color="#9ca3af"
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-center text-sm text-gray-500 dark:text-slate-400">
                  No follow-ups scheduled for today
                </Text>
              </View>
            ) : (
              <View className="divide-y divide-gray-100 dark:divide-slate-700">
                {todaysFollowUps.map((event, index) => (
                  <TouchableOpacity
                    key={`${event._id}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => {
                      // @ts-ignore - event._id is vendor id (same as website)
                      navigation.navigate('ViewVendor', { id: event._id });
                    }}
                    className="flex-row items-start gap-3 px-4 py-3"
                  >
                    <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                      <Ionicons
                        name={
                          event.type === 'CALL'
                            ? 'call-outline'
                            : event.type === 'VISIT'
                              ? 'location-outline'
                              : event.type === 'REVIEW'
                                ? 'document-text-outline'
                                : 'checkbox-outline'
                        }
                        size={18}
                        color="#2563eb"
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text
                        className="font-semibold text-gray-900 dark:text-slate-100"
                        numberOfLines={1}
                      >
                        {event.name}
                      </Text>
                      {event.note ? (
                        <Text
                          className="mt-0.5 text-sm text-gray-600 dark:text-slate-400"
                          numberOfLines={2}
                        >
                          {event.note}
                        </Text>
                      ) : null}
                      <View className="mt-2 flex-row flex-wrap gap-2">
                        <View className="rounded bg-gray-100 px-2 py-0.5 dark:bg-slate-700">
                          <Text className="text-xs font-medium text-gray-600 dark:text-slate-300">
                            {event.type}
                          </Text>
                        </View>
                        <View
                          className={`rounded px-2 py-0.5 ${
                            event.status === 'COMPLETED'
                              ? 'bg-green-100 dark:bg-green-900/40'
                              : event.status === 'CANCELLED'
                                ? 'bg-gray-100 dark:bg-slate-700'
                                : 'bg-amber-100 dark:bg-amber-900/40'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              event.status === 'COMPLETED'
                                ? 'text-green-700 dark:text-green-300'
                                : event.status === 'CANCELLED'
                                  ? 'text-gray-600 dark:text-slate-400'
                                  : 'text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {event.status}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-500 dark:text-slate-500">
                          {event.date
                            ? new Date(event.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-slate-100">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {filteredActions.map(action => (
              <TouchableOpacity
                key={action.title}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate(action.screen);
                }}
                className="min-w-[45%] flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg active:scale-95 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
              >
                <View
                  className={`h-14 w-14 ${action.color} mb-4 items-center justify-center rounded-2xl shadow-lg`}
                >
                  <Ionicons name={action.icon} size={26} color="#ffffff" />
                </View>
                <Text className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
