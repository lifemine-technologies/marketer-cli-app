import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import type { MainStackParamList } from '@/navigation/types';
import { reverseGeocode } from '@/utils/geocoding';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';
import {
  getMapPickerCallback,
  clearMapPickerCallback,
  type MapPickerResult,
} from '@/utils/mapPickerCallback';

const DEFAULT_REGION = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs your location to show your position on the map and set the vendor address.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  return true;
}

export function useMapPicker() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'MapPicker'>>();
  const params = route.params;
  const initialLat = params?.initialLat;
  const initialLng = params?.initialLng;

  const hasInitialCoords = initialLat != null && initialLng != null;

  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() =>
    hasInitialCoords ? { latitude: initialLat!, longitude: initialLng! } : null,
  );
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(() =>
    hasInitialCoords
      ? {
          latitude: initialLat!,
          longitude: initialLng!,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : null,
  );
  const [locationLoading, setLocationLoading] = useState(!hasInitialCoords);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 100);
    return () => {
      clearTimeout(t);
      clearMapPickerCallback();
    };
  }, []);

  // Set default region immediately so map shows right away
  useEffect(() => {
    if (!hasInitialCoords && !currentRegion) {
      setCurrentRegion(DEFAULT_REGION);
    }
  }, [hasInitialCoords, currentRegion]);

  // Fetch device current location in background (non-blocking)
  useEffect(() => {
    if (hasInitialCoords) {
      setLocationLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (cancelled || !hasPermission) {
        if (!cancelled) {
          setLocationLoading(false);
        }
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          if (cancelled) return;
          const { latitude, longitude } = position.coords;
          const region = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setUserLocation({ latitude, longitude });
          setCurrentRegion(region);
          // Set marker to user location if no marker is set yet
          if (!marker) {
            setMarker({ latitude, longitude });
          }
          setLocationLoading(false);
        },
        () => {
          if (!cancelled) {
            setLocationLoading(false);
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }, // Reduced timeout, allow cached location
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [hasInitialCoords]);

  const handleMapPress = (e: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const handleRegionChangeComplete = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    // Update marker to center of map when region changes
    setMarker({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleUseLocation = async () => {
    if (!marker) {
      Alert.alert('Select a location', 'Tap on the map to choose an address.');
      return;
    }
    if (!GOOGLE_MAPS_API_KEY.trim()) {
      Alert.alert('Technical Issue', 'Please contact support for assistance.');
      return;
    }
    setLoading(true);
    try {
      const address = await reverseGeocode(
        marker.latitude,
        marker.longitude,
        GOOGLE_MAPS_API_KEY,
      );
      if (address) {
        const result: MapPickerResult = {
          address,
          latitude: marker.latitude,
          longitude: marker.longitude,
        };
        const cb = getMapPickerCallback();
        cb?.(result);
        clearMapPickerCallback();
        navigation.goBack();
      } else {
        Alert.alert(
          'Address not found',
          'Could not get address for this location. Try another spot.',
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to get address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearMapPickerCallback();
    navigation.goBack();
  };

  // Map only mounts when we have a region, so it's always centered correctly (device location or initial coords)
  const initialRegion =
    currentRegion ??
    (marker || hasInitialCoords
      ? {
          latitude: marker?.latitude ?? initialLat!,
          longitude: marker?.longitude ?? initialLng!,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION);

  const canShowMap = mapReady && currentRegion != null;

  return {
    marker,
    loading,
    mapReady,
    initialRegion,
    canShowMap,
    locationLoading,
    userLocation,
    handleMapPress,
    handleRegionChangeComplete,
    handleUseLocation,
    handleCancel,
  };
}
