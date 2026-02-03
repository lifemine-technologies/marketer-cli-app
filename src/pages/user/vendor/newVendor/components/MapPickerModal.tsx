import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { reverseGeocode, type GeocodedAddress } from '@/utils/geocoding';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';

const DEFAULT_REGION = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export interface MapPickerResult {
  address: GeocodedAddress;
  latitude: number;
  longitude: number;
}

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: MapPickerResult) => void;
  initialLat?: number;
  initialLng?: number;
}

export function MapPickerModal({
  visible,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}: MapPickerModalProps) {
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() =>
    initialLat != null && initialLng != null
      ? { latitude: initialLat, longitude: initialLng }
      : null,
  );
  const [loading, setLoading] = useState(false);

  const handleMapPress = (e: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const handleUseLocation = async () => {
    if (!marker) {
      Alert.alert('Select a location', 'Tap on the map to choose an address.');
      return;
    }
    if (!GOOGLE_MAPS_API_KEY.trim()) {
      Alert.alert(
        'Configuration needed',
        'Google Maps API key is not set. Add GOOGLE_MAPS_API_KEY in .env at project root and restart Metro.',
      );
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
        onSelect({
          address,
          latitude: marker.latitude,
          longitude: marker.longitude,
        });
        onClose();
      } else {
        Alert.alert(
          'Address not found',
          'Could not get address for this location. Try another spot.',
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to get address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initialRegion =
    marker || (initialLat != null && initialLng != null)
      ? {
          latitude: marker?.latitude ?? initialLat!,
          longitude: marker?.longitude ?? initialLng!,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <SafeAreaProvider>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Pick address on map</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.mapWrap}>
              <MapView
                provider={
                  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                }
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
              >
                {marker && (
                  <MapView.Marker
                    coordinate={marker}
                    title="Selected address"
                  />
                )}
              </MapView>
            </View>
            <Text style={styles.hint}>
              Tap on the map to set the address location
            </Text>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.cancelBtn, loading && styles.disabled]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (!marker || loading) && styles.disabled,
                ]}
                onPress={handleUseLocation}
                disabled={!marker || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Use this location</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  mapWrap: {
    height: 320,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 20,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
});
