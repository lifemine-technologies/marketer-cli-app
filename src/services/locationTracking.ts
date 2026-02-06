/**
 * Location tracking for attendance. Implemented entirely in TypeScript (no Kotlin/native code).
 *
 * When does it work?
 * - App open (foreground or background): works — we send on active/inactive/background.
 * - App in background, screen off/locked: best effort (OS may keep or kill the app).
 * - App closed (killed): does NOT work in TypeScript — would require a native foreground service.
 * - Device off: does NOT work.
 */

import Geolocation from '@react-native-community/geolocation';
import { Platform, AppState, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';

const LOCATION_INTERVAL_MS = 5 * 60 * 1000;
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
 * Request location permissions (foreground and background).
 * Skips requesting if already granted to avoid duplicate permission dialogs.
 */
export const requestLocationPermissions = async (): Promise<{
  foreground: boolean;
  background: boolean;
}> => {
  if (Platform.OS === 'android') {
    try {
      // Check foreground first – skip request if already granted
      const hasFine =
        (await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        )) === true;
      const fineLocation = hasFine
        ? PermissionsAndroid.RESULTS.GRANTED
        : await PermissionsAndroid.request(
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
      if (fineLocation !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required');
        return { foreground: false, background: false };
      }

      // Request background location permission only if not already granted
      let backgroundGranted = false;
      if (Platform.Version >= 29) {
        const hasBackground =
          (await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          )) === true;
        if (hasBackground) {
          backgroundGranted = true;
        } else {
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
          }
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

    // Send initial location immediately when starting tracking (force send)
    console.log(
      'Starting background location tracking - sending initial location...',
    );
    await getLocationAndSend(true);

    // Wait a bit to ensure initial location is sent and timestamp is saved
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 1000);
    });

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
 * App state listener: keeps location tracking working in both foreground and background.
 * - Foreground (active): send location when app becomes active; retry pending start.
 * - Background (inactive/background): send location once when leaving foreground.
 * All logic is in TypeScript; no native (Kotlin/Java) code.
 */
let lastPendingStartAttempt = 0;
const PENDING_RETRY_MS = 3000;

export function registerLocationTrackingAppStateListener(): () => void {
  const subscription = AppState.addEventListener('change', async nextState => {
    try {
      if (nextState === 'active') {
        // Foreground: when app becomes active and tracking is running, send location now
        if (watchId !== null) {
          getLocationAndSend(true);
          return;
        }
        // Retry pending start (with rate limit)
        const now = Date.now();
        if (now - lastPendingStartAttempt < PENDING_RETRY_MS) return;
        const pending = await AsyncStorage.getItem(PENDING_START_KEY);
        if (pending !== 'true') return;
        const isActive = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (isActive !== 'true') return;
        lastPendingStartAttempt = now;
        await startBackgroundLocationTracking();
        return;
      }

      // Background: when app goes to inactive/background and tracking is active,
      // send location once so we have a position at transition (best effort)
      if (
        (nextState === 'inactive' || nextState === 'background') &&
        watchId !== null
      ) {
        getLocationAndSend(true);
      }
    } catch (err) {
      console.error('Location tracking app state handler failed:', err);
    }
  });

  return () => {
    subscription.remove();
  };
}
