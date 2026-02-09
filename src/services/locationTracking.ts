import {
  Platform,
  PermissionsAndroid,
  AppState,
  type AppStateStatus,
} from 'react-native';
import {
  startBackgroundLocationTrackingKotlin,
  stopBackgroundLocationTrackingKotlin,
  isLocationTrackingActiveKotlin,
} from './locationTrackingKotlin';

/**
 * Request location permissions (foreground and background)
 * @returns Object with foreground and background permission status
 */
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

  // iOS: Permissions are handled via Info.plist and native prompts
  // Return true as a placeholder - actual permission handling happens natively
  return { foreground: true, background: true };
}

/**
 * Start background location tracking
 * On Android, uses Kotlin foreground service for reliable background tracking
 * @returns Promise<boolean> - true if tracking started successfully
 */
export async function startBackgroundLocationTracking(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await startBackgroundLocationTrackingKotlin();
  }

  // iOS: Not implemented yet - would need native iOS implementation
  console.warn('Background location tracking not implemented for iOS');
  return false;
}

/**
 * Stop background location tracking
 * On Android, stops the Kotlin foreground service
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  if (Platform.OS === 'android') {
    await stopBackgroundLocationTrackingKotlin();
    return;
  }

  // iOS: Not implemented yet
  console.warn('Background location tracking not implemented for iOS');
}

/**
 * Check if location tracking is currently active
 * @returns Promise<boolean> - true if tracking is active
 */
export async function isLocationTrackingActive(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await isLocationTrackingActiveKotlin();
  }

  // iOS: Not implemented yet
  return false;
}
