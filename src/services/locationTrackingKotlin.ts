import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/url';
const { LocationTrackingModule } = NativeModules;

export const startBackgroundLocationTrackingKotlin =
  async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !LocationTrackingModule) {
      console.warn('LocationTrackingModule not available');
      return false;
    }

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const apiBaseUrl = API_CONFIG.BASE_URL;

      if (!accessToken || !apiBaseUrl) {
        console.error('Missing access token or API base URL');
        return false;
      }
      // Restart service to ensure fresh token/baseUrl
      await LocationTrackingModule.stopTracking();
      await LocationTrackingModule.startTracking(apiBaseUrl, accessToken);
      return true;
    } catch (error) {
      console.error('Error starting Kotlin location tracking:', error);
      return false;
    }
  };

export const stopBackgroundLocationTrackingKotlin = async (): Promise<void> => {
  if (Platform.OS !== 'android' || !LocationTrackingModule) {
    return;
  }

  try {
    await LocationTrackingModule.stopTracking();
  } catch (error) {
    console.error('Error stopping Kotlin location tracking:', error);
  }
};

export const isLocationTrackingActiveKotlin = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !LocationTrackingModule) {
    return false;
  }

  try {
    return await LocationTrackingModule.isTrackingActive();
  } catch (error) {
    console.error('Error checking Kotlin location tracking status:', error);
    return false;
  }
};
