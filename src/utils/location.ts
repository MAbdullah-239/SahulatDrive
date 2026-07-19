import GetLocation from 'react-native-get-location';

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

export const getCurrentLocation = async (): Promise<Coordinates> => {
  if (cachedFix && Date.now() - cachedFix.timestamp < CACHE_TTL_MS) {
    console.log('[location] using cached fix', cachedFix.coords);
    return cachedFix.coords;
  }

  console.log('[location] requesting a fresh fix…');
  const location = await GetLocation.getCurrentPosition({
    enableHighAccuracy: false,
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
 */
export const requestCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    return await getCurrentLocation();
  } catch (error: any) {
    console.log('[location] failed:', error?.code, error?.message);
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
