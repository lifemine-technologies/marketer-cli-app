import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ServiceCoverageMapProps {
  coordinates: [number, number]; // [longitude, latitude]
  radiusKm: number;
}

const mapStyles = StyleSheet.create({
  map: {
    width: '100%',
    height: 384, // h-96 equivalent
  },
});

// Calculate zoom level based on radius (similar to website logic)
const calculateZoomForRadius = (radiusKm: number): number => {
  const bufferRadius = radiusKm + 5;
  // Rough calculation: each zoom level doubles the area
  // Zoom 12 shows roughly 20km area, adjust based on radius
  const zoom = Math.max(7, 15 - Math.log2(bufferRadius / 5));
  return zoom;
};

// Convert zoom level to latitudeDelta for MapView
const zoomToLatitudeDelta = (zoom: number): number => {
  // Approximate conversion: zoom 15 = ~0.01 delta, zoom 10 = ~0.1 delta
  return Math.pow(2, 15 - zoom) * 0.01;
};

export const ServiceCoverageMap: React.FC<ServiceCoverageMapProps> = ({
  coordinates,
  radiusKm,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  // API returns [longitude, latitude], react-native-maps uses [latitude, longitude]
  const [longitude, latitude] = coordinates;

  const zoomLevel = calculateZoomForRadius(radiusKm);
  const latitudeDelta = zoomToLatitudeDelta(zoomLevel);
  const longitudeDelta = latitudeDelta;

  useEffect(() => {
    // Small delay to ensure map is ready
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animate to region when map is ready
  useEffect(() => {
    if (mapReady && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta,
          },
          500,
        );
      }, 200);
    }
  }, [mapReady, latitude, longitude, latitudeDelta, longitudeDelta]);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b p-6 pb-0">
        <CardTitle className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Ionicons name="location-outline" size={20} color="#2563eb" />
            </View>
            <Text className="text-xl font-bold">Service Coverage</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {radiusKm}
            </Text>
            <Text className="text-base text-gray-600 dark:text-slate-400">
              km
            </Text>
          </View>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <View className="relative w-full bg-gray-100 dark:bg-slate-800">
          {!mapReady && (
            <View className="absolute inset-0 items-center justify-center bg-gray-100/50 dark:bg-slate-800/50 z-10 rounded-b-lg">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          {mapReady && (
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={mapStyles.map}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta,
                longitudeDelta,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {/* Service Area Circle */}
              <Circle
                center={{
                  latitude,
                  longitude,
                }}
                radius={radiusKm * 1000} // Convert km to meters
                strokeColor="#2563eb"
                fillColor="rgba(37, 99, 235, 0.15)"
                strokeWidth={2}
              />
              {/* Vendor Location Marker */}
              <Marker
                coordinate={{
                  latitude,
                  longitude,
                }}
                title="Vendor Location"
                description={`Service radius: ${radiusKm} km`}
              >
                <View className="items-center justify-center">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg">
                    <Ionicons name="location" size={24} color="#ffffff" />
                  </View>
                </View>
              </Marker>
            </MapView>
          )}
        </View>
      </CardContent>
    </Card>
  );
};
