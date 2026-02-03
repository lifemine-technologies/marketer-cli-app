import type { GeocodedAddress } from '@/utils/geocoding';

export interface MapPickerResult {
  address: GeocodedAddress;
  latitude: number;
  longitude: number;
}

let pendingCallback: ((result: MapPickerResult) => void) | null = null;

export function setMapPickerCallback(
  cb: ((result: MapPickerResult) => void) | null,
) {
  pendingCallback = cb;
}

export function getMapPickerCallback():
  | ((result: MapPickerResult) => void)
  | null {
  return pendingCallback;
}

export function clearMapPickerCallback() {
  pendingCallback = null;
}
