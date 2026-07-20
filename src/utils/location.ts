import GetLocation from 'react-native-get-location';
import {GOOGLE_MAPS_API_KEY} from '@env';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// react-native-get-location requests the OS permission itself (with this
// rationale on Android) and rejects with a real {code, message} — including
// a genuinely-enforced TIMEOUT — instead of @react-native-community/
// geolocation's approach of forwarding straight to the native module and
// leaving the JS side with no guarantee the timeout option is honored.
const RATIONALE = {
  title: 'Location Permission',
  message:
    'SahulatDrive needs your location to find nearby help and share your position with your assigned provider.',
  buttonPositive: 'OK',
};

// Short-lived in-memory cache: once any screen gets a fix, every other call in
// this app session reuses it instantly instead of re-polling the location
// manager. 60s is comfortable for "which nearby provider can help" accuracy.
const CACHE_TTL_MS = 60000;
let cachedFix: {coords: Coordinates; timestamp: number} | null = null;

export const getCurrentLocation = async (
  forceRefresh = false,
): Promise<Coordinates> => {
  if (
    !forceRefresh &&
    cachedFix &&
    Date.now() - cachedFix.timestamp < CACHE_TTL_MS
  ) {
    console.log('[location] using cached fix', cachedFix.coords);
    return cachedFix.coords;
  }

  console.log('[location] requesting a fresh fix…');
  const location = await GetLocation.getCurrentPosition({
    enableHighAccuracy: forceRefresh,
    timeout: 8000,
    rationale: RATIONALE,
  });

  const coords: Coordinates = {
    latitude: location.latitude,
    longitude: location.longitude,
  };
  console.log('[location] got a fix', coords);
  cachedFix = {coords, timestamp: Date.now()};
  return coords;
};

/**
 * Convenience wrapper: fetch a fix, swallowing permission-denied/timeout/
 * unavailable errors into null so callers can fall back gracefully instead
 * of wrapping every call site in try/catch.
 *
 * Pass forceRefresh=true for anything sent to the backend as "the user's
 * current position right now" (submitting a help request, going online) —
 * the 60s cache below is fine for map recentering/UI display, but is exactly
 * why those calls could look "static": a stale fix from up to a minute ago.
 */
export const requestCurrentLocation = async (
  forceRefresh = false,
): Promise<Coordinates | null> => {
  try {
    return await getCurrentLocation(forceRefresh);
  } catch (error: any) {
    console.log('[location] failed:', error?.code, error?.message);
    return null;
  }
};

/**
 * Reverse-geocodes coordinates into a human-readable place name via Google's
 * Geocoding API (same GOOGLE_MAPS_API_KEY already used for the map SDK).
 * Returns null on any failure (no key, no network, no results) so callers can
 * fall back to showing raw coordinates.
 */
export const reverseGeocode = async (
  coords: Coordinates,
): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    if (json.status !== 'OK' || !json.results?.length) {
      console.log('[location] reverse geocode failed:', json.status);
      return null;
    }
    return json.results[0].formatted_address as string;
  } catch (error) {
    console.log('[location] reverse geocode error:', error);
    return null;
  }
};

/**
 * Call once, as early as possible (app start, post-login) so permission is
 * granted and the cache above is warm well before the user ever taps
 * "Request Help" or "Go Online" — by then this resolves instantly.
 */
export const warmUpLocation = () => {
  requestCurrentLocation().catch(() => {});
};
