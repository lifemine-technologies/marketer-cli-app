import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { VendorFormData } from '@/utils/validations/vendorSchema';
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';

interface ServiceCoverageProps {
  control: Control<VendorFormData>;
  errors: FieldErrors<VendorFormData>;
  setValue: UseFormSetValue<VendorFormData>;
  watch: (name?: keyof VendorFormData | (keyof VendorFormData)[]) => any;
  servicePlacesInput: string;
  setServicePlacesInput: (value: string) => void;
  addressLatitude?: number;
  addressLongitude?: number;
}

const mapStyles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
  },
});

export const ServiceCoverage = ({
  control,
  errors,
  setValue,
  watch,
  servicePlacesInput,
  setServicePlacesInput,
  addressLatitude,
  addressLongitude,
}: ServiceCoverageProps) => {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Watch form values reactively - use watch function for safer access
  const radius = watch('serviceArea.radius' as any) || 10;
  const pinPoint = watch('pinPoint' as any);
  const servicePlacesWatch = watch('servicePlaces' as any);
  const servicePlaces = Array.isArray(servicePlacesWatch)
    ? servicePlacesWatch
    : [];

  // Use pinPoint or address coordinates, default to Hyderabad
  const defaultLat = pinPoint?.coordinates?.[1] || addressLatitude || 17.385;
  const defaultLng = pinPoint?.coordinates?.[0] || addressLongitude || 78.4867;

  const [latitude, setLatitude] = useState(defaultLat);
  const [longitude, setLongitude] = useState(defaultLng);

  // Update coordinates when address changes
  useEffect(() => {
    if (addressLatitude && addressLongitude) {
      setLatitude(addressLatitude);
      setLongitude(addressLongitude);
      // Update pinPoint and serviceArea.location
      setValue('pinPoint', {
        type: 'Point',
        coordinates: [addressLongitude, addressLatitude],
      });
      setValue('serviceArea.location', {
        type: 'Point',
        coordinates: [addressLongitude, addressLatitude],
      });
    }
  }, [addressLatitude, addressLongitude, setValue]);

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update map region when radius changes
  useEffect(() => {
    if (mapReady && mapRef.current && latitude && longitude) {
      const radiusKm = radius || 10;
      const latitudeDelta = Math.max(0.01, (radiusKm * 2) / 111);
      const longitudeDelta = Math.max(
        0.01,
        (radiusKm * 2) / (111 * Math.cos((latitude * Math.PI) / 180)),
      );
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        },
        300,
      );
    }
  }, [mapReady, latitude, longitude, radius]);

  // Handle map region change to update coordinates
  const handleRegionChangeComplete = React.useCallback(
    (region: {
      latitude: number;
      longitude: number;
      latitudeDelta?: number;
      longitudeDelta?: number;
    }) => {
      setLatitude(region.latitude);
      setLongitude(region.longitude);
      // Update pinPoint and serviceArea.location when user pans map
      setValue('pinPoint', {
        type: 'Point',
        coordinates: [region.longitude, region.latitude],
      });
      setValue('serviceArea.location', {
        type: 'Point',
        coordinates: [region.longitude, region.latitude],
      });
    },
    [setValue],
  );

  const handleAddServicePlace = () => {
    const val = servicePlacesInput.trim();
    if (val) {
      const current = servicePlaces || [];
      if (!current.includes(val)) {
        setValue('servicePlaces', [...current, val]);
        setServicePlacesInput('');
      }
    }
  };

  return (
    <Card className="mb-2">
      <CardHeader>
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#2563eb"
            />
          </View>
          <CardTitle>Service Coverage</CardTitle>
        </View>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radius Input */}
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Service Radius:{' '}
              <Text className="text-blue-600 dark:text-blue-400">
                {radius} km
              </Text>
            </Text>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold"
            >
              GPS Based
            </Badge>
          </View>
          <Controller
            control={control}
            name="serviceArea.radius"
            render={({ field: { value, onChange } }) => (
              <View>
                <Input
                  value={value?.toString() || '10'}
                  onChangeText={text => {
                    const num = parseInt(text, 10) || 0;
                    const clamped = Math.max(1, Math.min(100, num));
                    onChange(clamped);
                  }}
                  placeholder="10"
                  keyboardType="numeric"
                  error={errors.serviceArea?.radius?.message}
                />
                <Text className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Area where the vendor is visible on the map (1-100 km)
                </Text>
              </View>
            )}
          />
        </View>

        {/* Map Visualization */}
        <View className="relative w-full bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          {!mapReady && (
            <View className="absolute inset-0 items-center justify-center bg-gray-100/50 dark:bg-slate-800/50 z-10">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          {mapReady && latitude && longitude && (
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={mapStyles.map}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: Math.max(0.01, ((radius || 10) * 2) / 111),
                longitudeDelta: Math.max(0.01, ((radius || 10) * 2) / 111),
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
              showsUserLocation={false}
              showsMyLocationButton={false}
              onRegionChangeComplete={handleRegionChangeComplete}
            >
              {/* Service Area Circle */}
              <Circle
                center={{
                  latitude,
                  longitude,
                }}
                radius={(radius || 10) * 1000} // Convert km to meters
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
                description={`Service radius: ${radius} km`}
              >
                <View className="items-center justify-center">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-red-600 border-2 border-white shadow-lg">
                    <Ionicons name="location" size={20} color="#ffffff" />
                  </View>
                </View>
              </Marker>
            </MapView>
          )}
        </View>

        {/* Service Places */}
        <View className="space-y-3">
          <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Manual Regions
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={servicePlacesInput}
                onChangeText={setServicePlacesInput}
                placeholder="Add city/town and press Enter"
                onSubmitEditing={handleAddServicePlace}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddServicePlace}
              className="justify-center rounded-lg border border-blue-600 bg-blue-600 px-4 py-3"
            >
              <Ionicons name="add" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {servicePlaces.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {servicePlaces.map((place: string, index: number) => (
                <View key={index} className="flex-row items-center">
                  <Badge
                    variant="secondary"
                    className="px-2 py-1 text-xs gap-1.5"
                  >
                    {place}
                  </Badge>
                  <TouchableOpacity
                    onPress={() => {
                      const newVal = servicePlaces.filter(
                        (_, i) => i !== index,
                      );
                      setValue('servicePlaces', newVal);
                    }}
                    className="ml-1"
                  >
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xs text-gray-500 dark:text-slate-400 italic">
              No manual regions added.
            </Text>
          )}
        </View>

        {/* Tip */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex-row items-start gap-3">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#2563eb"
            className="mt-0.5"
          />
          <Text className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed flex-1">
            <Text className="font-semibold">Tip:</Text> Adding specific cities
            helps users find you in search even if they are outside your direct
            GPS radius.
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};
