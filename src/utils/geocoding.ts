/**
 * Reverse geocode: convert lat/lng to address components using Google Geocoding API.
 * Requires GOOGLE_MAPS_API_KEY and Geocoding API enabled in Google Cloud.
 */

export interface GeocodedAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  code: string;
}

function getComponent(
  components: { long_name: string; short_name: string; types: string[] }[],
  ...types: string[]
): string {
  const c = components.find(x => types.some(t => x.types.includes(t)));
  return c?.long_name ?? '';
}

function getPostalCode(
  components: { long_name: string; short_name: string; types: string[] }[],
): string {
  const c = components.find(x => x.types.includes('postal_code'));
  return c?.long_name ?? '';
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  apiKey: string,
): Promise<GeocodedAddress | null> {
  if (!apiKey.trim()) {
    console.warn('GOOGLE_MAPS_API_KEY is not set; cannot reverse geocode.');
    return null;
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    const result = data.results[0];
    const components = result.address_components || [];
    const streetNumber = getComponent(components, 'street_number');
    const route = getComponent(components, 'route');
    const line1 =
      [streetNumber, route].filter(Boolean).join(' ') ||
      result.formatted_address?.split(',')[0] ||
      '';
    const city =
      getComponent(components, 'locality') ||
      getComponent(components, 'sublocality', 'sublocality_level_1') ||
      getComponent(components, 'administrative_area_level_2');
    const state = getComponent(components, 'administrative_area_level_1');
    const country = getComponent(components, 'country');
    const code = getPostalCode(components);
    return {
      line1: line1.trim() || 'Address',
      city: city.trim() || '',
      state: state.trim() || '',
      country: country.trim() || '',
      code: code.trim() || '',
    };
  } catch (e) {
    console.error('Reverse geocode error:', e);
    return null;
  }
}
