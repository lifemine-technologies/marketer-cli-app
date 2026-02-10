import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { userAPI } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';
import {
  startBackgroundLocationTrackingKotlin,
  stopBackgroundLocationTrackingKotlin,
  isLocationTrackingActiveKotlin,
} from './locationTrackingKotlin';

let foregroundInterval: ReturnType<typeof setInterval> | null = null;
let isSendingForeground = false;
const FOREGROUND_INTERVAL_MS = 5 * 60 * 1000;

async function sendForegroundLocationOnce(): Promise<void> {
  if (isSendingForeground) return;
  isSendingForeground = true;
  try {
    await new Promise<void>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async position => {
          try {
            const coordinates: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            await userAPI.post(API_ENDPOINTS.MARKETER.ATTENDANCE.LOCATION, {
              location: { type: 'Point', coordinates },
              accuracy: position.coords.accuracy,
              speed:
                typeof position.coords.speed === 'number'
                  ? position.coords.speed
                  : null,
            });
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        err => reject(err),
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 5000,
        },
      );
    });
  } catch (e) {
    console.warn('[ForegroundLocation] send failed:', e);
  } finally {
    isSendingForeground = false;
  }
}

export async function startForegroundLocationTracking(): Promise<boolean> {
  if (foregroundInterval) return true;
  void sendForegroundLocationOnce();
  foregroundInterval = setInterval(() => {
    void sendForegroundLocationOnce();
  }, FOREGROUND_INTERVAL_MS);
  return true;
}

export function stopForegroundLocationTracking(): void {
  if (foregroundInterval) {
    clearInterval(foregroundInterval);
    foregroundInterval = null;
  }
}

export async function requestLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  if (Platform.OS === 'android') {
    try {
      // Request foreground location permission
      const foregroundGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs your location to track your attendance.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      const foreground =
        foregroundGranted === PermissionsAndroid.RESULTS.GRANTED;

      // Request background location permission (Android 10+)
      let background = false;
      if (Platform.Version >= 29 && foreground) {
        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message:
              'This app needs background location access to track your location while you are working.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        background = backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else if (foreground) {
        background = true;
      }

      return { foreground, background };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { foreground: false, background: false };
    }
  }
  return { foreground: true, background: true };
}

export async function startBackgroundLocationTracking(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await startBackgroundLocationTrackingKotlin();
  }
  console.warn('Background location tracking not implemented for iOS');
  return false;
}

export async function stopBackgroundLocationTracking(): Promise<void> {
  if (Platform.OS === 'android') {
    await stopBackgroundLocationTrackingKotlin();
    return;
  }
  console.warn('Background location tracking not implemented for iOS');
}

export async function isLocationTrackingActive(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await isLocationTrackingActiveKotlin();
  }
  return false;
}
