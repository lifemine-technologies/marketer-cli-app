import Geolocation from '@react-native-community/geolocation';
import { Platform, AppState, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';

const LOCATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const LOCATION_STORAGE_KEY = 'isLocationTrackingActive';
const LAST_LOCATION_SENT_KEY = 'lastLocationSentAt';
const PENDING_START_KEY = 'pendingLocationTrackingStart';

let watchId: number | null = null;
let startInProgress = false;

export interface LocationData {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  accuracy?: number;
  speed?: number | null;
  isMocked?: boolean;
}

/**
 * Request location permissions for Android
 * Returns: { foreground: boolean, background: boolean }
 */
const requestLocationPermissions = async (): Promise<{
  foreground: boolean;
  background: boolean;
}> => {
  if (Platform.OS === 'android') {
    try {
      // Request foreground location permission (required)
      const fineLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (fineLocation !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required');
        return { foreground: false, background: false };
      }

      // Request background location permission for Android 10+ (optional)
      let backgroundGranted = false;
      if (Platform.Version >= 29) {
        try {
          const backgroundLocation = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          );
          backgroundGranted =
            backgroundLocation === PermissionsAndroid.RESULTS.GRANTED;
          if (!backgroundGranted) {
            Alert.alert(
              'Background Permission Not Granted',
              'Background location permission is not granted. Location will only be tracked when the app is open.',
            );
          }
        } catch (bgErr) {
          console.warn('Error requesting background permission:', bgErr);
          // Continue without background permission
        }
      }

      return { foreground: true, background: backgroundGranted };
    } catch (err) {
      console.error('Error requesting location permissions:', err);
      return { foreground: false, background: false };
    }
  }
  return { foreground: true, background: true }; // iOS handles permissions automatically
};

/**
 * Send location to API
 */
const sendLocationToAPI = async (locationData: LocationData) => {
  try {
    console.log(
      'Sending location to API:',
      API_ENDPOINTS.MARKETER.ATTENDANCE.LOCATION,
      locationData,
    );
    const response = await userAPI.post(
      API_ENDPOINTS.MARKETER.ATTENDANCE.LOCATION,
      locationData,
    );
    await AsyncStorage.setItem(LAST_LOCATION_SENT_KEY, String(Date.now()));
    console.log(
      'Location sent successfully to API:',
      locationData.location.coordinates,
      response.status,
    );
  } catch (err: any) {
    console.error(
      'Failed to send location to API:',
      err?.response?.data || err?.message || err,
    );
  }
};

/**
 * Get location and send to API (with rate limiting)
 */
const getLocationAndSend = async (force: boolean = false) => {
  try {
    // Check if we sent location recently (rate limiting) - skip if not forced
    if (!force) {
      const lastSentStr = await AsyncStorage.getItem(LAST_LOCATION_SENT_KEY);
      const lastSent = lastSentStr ? parseInt(lastSentStr, 10) : 0;
      const now = Date.now();
      if (lastSent && now - lastSent < LOCATION_INTERVAL_MS) {
        console.log('Skipping location send - rate limit');
        return; // Skip - rate limit
      }
    }

    console.log('Getting current location...');
    Geolocation.getCurrentPosition(
      async position => {
        const locationData: LocationData = {
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ?? null,
          isMocked: position.coords.accuracy < 10,
        };
        console.log(
          'Got location, sending to API:',
          locationData.location.coordinates,
        );
        await sendLocationToAPI(locationData);
      },
      error => {
        console.error('Error getting location in getLocationAndSend:', error);
      },
      {
        enableHighAccuracy: false, // Use false for faster response
        timeout: 30000,
        maximumAge: 60000,
      },
    );
  } catch (err) {
    console.error('Error in getLocationAndSend:', err);
  }
};

/**
 * Start background location tracking
 */
export const startBackgroundLocationTracking = async (): Promise<boolean> => {
  if (startInProgress) {
    return false;
  }
  startInProgress = true;

  try {
    // Check if already running
    if (watchId !== null) {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, 'true');
      return true;
    }

    // Request permissions
    const permissions = await requestLocationPermissions();
    if (!permissions.foreground) {
      console.error('Foreground location permission denied');
      return false;
    }

    // Log background permission status
    if (!permissions.background) {
      console.warn(
        'Background location permission not granted. Tracking will work only when app is in foreground.',
      );
    }

    // Check if app is in foreground (Android requirement)
    if (Platform.OS === 'android' && AppState.currentState !== 'active') {
      await AsyncStorage.setItem(PENDING_START_KEY, 'true');
      console.warn(
        'App is in background. Location will start when you open the app.',
      );
      return false;
    }

    // Send initial location immediately when starting tracking (force send)
    console.log(
      'Starting background location tracking - sending initial location...',
    );
    await getLocationAndSend(true);

    // Wait a bit to ensure initial location is sent and timestamp is saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start watching position
    watchId = Geolocation.watchPosition(
      async position => {
        const locationData: LocationData = {
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ?? null,
          isMocked: position.coords.accuracy < 10,
        };

        // Check rate limiting before sending
        const lastSentStr = await AsyncStorage.getItem(LAST_LOCATION_SENT_KEY);
        const lastSent = lastSentStr ? parseInt(lastSentStr, 10) : 0;
        const now = Date.now();
        if (!lastSent || now - lastSent >= LOCATION_INTERVAL_MS) {
          await sendLocationToAPI(locationData);
        } else {
          console.log(
            'Skipping location send from watchPosition - rate limit (last sent:',
            Math.round((now - lastSent) / 1000),
            'seconds ago)',
          );
        }
      },
      error => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: false, //  for better battery and faster response
        distanceFilter: 50,
        interval: LOCATION_INTERVAL_MS,
        fastestInterval: LOCATION_INTERVAL_MS,
      },
    );

    // Also set up interval as backup (but wait a bit to avoid duplicate with initial send)
    const backupTimeoutId = setTimeout(() => {
      const backupInterval = setInterval(() => {
        getLocationAndSend();
      }, LOCATION_INTERVAL_MS);
      // Store the backup interval ID
      (watchId as any).backupIntervalId = backupInterval;
    }, LOCATION_INTERVAL_MS); // Wait for initial send interval before starting backup

    // Store timeout ID for cleanup
    (watchId as any).backupTimeoutId = backupTimeoutId;

    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, 'true');
    await AsyncStorage.removeItem(PENDING_START_KEY);
    console.log('Background location tracking started');
    return true;
  } catch (err) {
    console.error('Error starting location tracking:', err);
    return false;
  } finally {
    startInProgress = false;
  }
};

/**
 * Stop background location tracking
 */
export const stopBackgroundLocationTracking = async () => {
  try {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      // Clear timeout and interval if exists
      if ((watchId as any).backupTimeoutId) {
        clearTimeout((watchId as any).backupTimeoutId);
      }
      if ((watchId as any).backupIntervalId) {
        clearInterval((watchId as any).backupIntervalId);
      }
      watchId = null;
    }
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, 'false');
    await AsyncStorage.removeItem(LAST_LOCATION_SENT_KEY);
    await AsyncStorage.removeItem(PENDING_START_KEY);
    console.log('Background location tracking stopped');
  } catch (err) {
    console.error('Error stopping location tracking:', err);
  }
};

/**
 * Check if location tracking is active
 */
export const isLocationTrackingActive = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    return value === 'true' && watchId !== null;
  } catch (err) {
    console.error('Error checking location tracking status:', err);
    return false;
  }
};

/**
 * Register app state listener to handle pending starts
 */
let lastPendingStartAttempt = 0;
const PENDING_RETRY_MS = 3000;

export function registerLocationTrackingAppStateListener(): () => void {
  const subscription = AppState.addEventListener('change', async nextState => {
    if (nextState !== 'active') return;
    const now = Date.now();
    if (now - lastPendingStartAttempt < PENDING_RETRY_MS) return;

    try {
      const pending = await AsyncStorage.getItem(PENDING_START_KEY);
      if (pending !== 'true') return;

      const isActive = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (isActive !== 'true') return;

      lastPendingStartAttempt = now;
      await startBackgroundLocationTracking();
    } catch (err) {
      console.error('Pending location start failed:', err);
    }
  });

  return () => {
    subscription.remove();
  };
}
