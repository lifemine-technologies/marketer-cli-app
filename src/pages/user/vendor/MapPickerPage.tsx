import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
    userLocation,
    handleMapPress,
    handleRegionChangeComplete,
    handleUseLocation,
    handleCancel,
  } = useMapPicker();

  const handleMapReady = () => {
    if (!mapRef.current || !initialRegion) return;
    setTimeout(() => {
      mapRef.current?.animateToRegion?.(initialRegion, 400);
      // Initialize marker to center of initial region if not set
      if (!marker) {
        handleRegionChangeComplete(initialRegion);
      }
    }, 100);
  };

  // Update map region when user location is available
  React.useEffect(() => {
    if (userLocation && mapRef.current) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 500);
      // Update marker to user location
      handleRegionChangeComplete(region);
    }
  }, [userLocation]);

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-xl">
        {canShowMap ? (
          <>
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={mapStyles.fill}
              initialRegion={initialRegion}
              onMapReady={handleMapReady}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={true}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Your Location"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#2563eb',
                      borderWidth: 3,
                      borderColor: '#ffffff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="location" size={12} color="#ffffff" />
                  </View>
                </Marker>
              )}
            </MapView>
            {/* Fixed Center Marker - Always at center of screen */}
            <View
              className="absolute inset-0 items-center justify-center"
              pointerEvents="none"
              style={{ zIndex: 1000 }}
            >
              <View style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* Red Circle (Pin Head) */}
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#ef4444',
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="location" size={14} color="#ffffff" />
                </View>
                {/* Pin Point */}
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 12,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: '#dc2626',
                    marginTop: -1,
                  }}
                />
              </View>
            </View>
            {locationLoading && (
              <View
                className="absolute top-4 left-4 right-4 items-center rounded-lg bg-white/90 px-4 py-2 shadow-lg dark:bg-slate-800/90"
                style={{ zIndex: 1000 }}
              >
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text className="ml-2 text-xs text-gray-600 dark:text-slate-400">
                    Getting your location...
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-3 text-sm text-gray-600 dark:text-slate-400">
              Loading map...
            </Text>
          </View>
        )}
      </View>
      <Text className="mx-5 mt-2 text-xs text-gray-500 dark:text-slate-400">
        Drag the map to position the marker at your desired location
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
            loading && 'opacity-60',
          )}
          onPress={handleUseLocation}
          disabled={loading}
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
