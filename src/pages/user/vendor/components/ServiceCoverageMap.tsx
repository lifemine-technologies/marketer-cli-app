import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ServiceCoverageMapProps {
  coordinates: [number, number];
  radiusKm: number;
}

const mapStyles = StyleSheet.create({
  map: {
    width: '100%',
    height: 384,
  },
  fullScreenMap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

const calculateZoomForRadius = (radiusKm: number): number => {
  const bufferRadius = radiusKm + 5;
  const zoom = Math.max(7, 15 - Math.log2(bufferRadius / 5));
  return zoom;
};

const zoomToLatitudeDelta = (zoom: number): number => {
  return Math.pow(2, 15 - zoom) * 0.01;
};

export const ServiceCoverageMap: React.FC<ServiceCoverageMapProps> = ({
  coordinates,
  radiusKm,
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const mapRef = useRef<MapView>(null);
  const fullScreenMapRef = useRef<MapView>(null);
  const [longitude, latitude] = coordinates;
  const zoomLevel = calculateZoomForRadius(radiusKm);
  const latitudeDelta = zoomToLatitudeDelta(zoomLevel);
  const longitudeDelta = latitudeDelta;

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (isMaximized && fullScreenMapRef.current) {
      setTimeout(() => {
        fullScreenMapRef.current?.animateToRegion(
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
  }, [isMaximized, latitude, longitude, latitudeDelta, longitudeDelta]);

  const renderMapContent = (mapRefToUse: React.RefObject<MapView>) => (
    <>
      <Circle
        center={{
          latitude,
          longitude,
        }}
        radius={radiusKm * 1000}
        strokeColor="#2563eb"
        fillColor="rgba(37, 99, 235, 0.15)"
        strokeWidth={2}
      />
      <Marker
        coordinate={{
          latitude,
          longitude,
        }}
        title="Vendor Location"
        description={`Service radius: ${radiusKm} km`}
        anchor={{ x: 0.5, y: 1 }}
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
      </Marker>
    </>
  );

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="border-b p-6 pb-0">
          <View className="flex-row items-center justify-between">
            <View
              className="flex-row items-center"
              style={{ flex: 1, marginRight: 12 }}
            >
              <View className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ionicons name="location-outline" size={20} color="#2563eb" />
              </View>
              <Text className="ml-3 text-xl font-bold">Service Coverage</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {radiusKm}
              </Text>
              <Text className="ml-1 text-base text-gray-600 dark:text-slate-400">
                km
              </Text>
            </View>
          </View>
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
                provider={
                  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                }
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
                {renderMapContent(mapRef)}
              </MapView>
            )}
            <TouchableOpacity
              onPress={() => setIsMaximized(true)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#ffffff',
                borderRadius: 8,
                padding: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 5,
                zIndex: 1000,
              }}
            >
              <Ionicons name="expand-outline" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      <Modal
        visible={isMaximized}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMaximized(false)}
      >
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
          {/* Header */}
          <View className="flex-row items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <View className="flex-row items-center" style={{ flex: 1 }}>
              <View className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ionicons name="location-outline" size={20} color="#2563eb" />
              </View>
              <View className="ml-3">
                <Text className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Service Coverage
                </Text>
                <Text className="text-sm text-gray-600 dark:text-slate-400">
                  {radiusKm} km radius
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsMaximized(false)}
              className="rounded-lg bg-gray-200 dark:bg-slate-700 p-2"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Full Screen Map */}
          <View className="flex-1">
            <MapView
              ref={fullScreenMapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={mapStyles.fullScreenMap}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta,
                longitudeDelta,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {renderMapContent(fullScreenMapRef)}
            </MapView>
          </View>
        </View>
      </Modal>
    </>
  );
};
