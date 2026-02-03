import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { cn } from '@/lib/utils';
import { useMapPicker } from '@/hooks/useMapPicker';

const mapStyles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
});

export function MapPickerPage() {
  const mapRef = useRef<MapView>(null);
  const {
    marker,
    loading,
    canShowMap,
    initialRegion,
    locationLoading,
    handleMapPress,
    handleUseLocation,
    handleCancel,
  } = useMapPicker();

  const handleMapReady = () => {
    if (!mapRef.current || !initialRegion) return;
    setTimeout(() => {
      mapRef.current?.animateToRegion?.(initialRegion, 400);
    }, 100);
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-xl">
        {locationLoading ? (
          <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-3 text-sm text-gray-600 dark:text-slate-400">
              Getting your location...
            </Text>
          </View>
        ) : canShowMap ? (
          <>
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={mapStyles.fill}
              initialRegion={initialRegion}
              onMapReady={handleMapReady}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton
            />
            {marker && (
              <View
                className="absolute inset-0 items-center justify-center"
                pointerEvents="none"
              >
                <View className="h-6 w-6 rounded-full border-[3px] border-white bg-red-600" />
              </View>
            )}
          </>
        ) : null}
      </View>
      <Text className="mx-5 mt-2 text-xs text-gray-500 dark:text-slate-400">
        Tap on the map to set the address location
      </Text>
      <View className="flex-row gap-3 px-5 py-4 pb-6">
        <TouchableOpacity
          className={cn(
            'flex-1 items-center rounded-xl border border-gray-300 py-3.5 dark:border-slate-600',
            loading && 'opacity-60',
          )}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-gray-700 dark:text-slate-300">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={cn(
            'flex-1 min-h-[52px] items-center justify-center rounded-xl bg-blue-600 py-3.5',
            (!marker || loading) && 'opacity-60',
          )}
          onPress={handleUseLocation}
          disabled={!marker || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              Use this location
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
