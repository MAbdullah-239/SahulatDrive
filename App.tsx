import React, {useEffect, useState} from 'react';
import {AppState, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import {setUser, logout} from './src/redux/slices/authSlice';
import {setVerified} from './src/redux/slices/providerSlice';
import RootNavigation from './src/navigation/rootNavigation';
import {warmUpLocation} from './src/utils/location';
import {getCurrentUser} from './src/requestHandler/api';
import {registerDeviceToken} from './src/utils/registerDeviceToken';
import {navigationRef, resetToProviderStack} from './src/navigation/navigationRef';
import {setUpPushNavigation} from './src/utils/pushNavigation';

// Shared by cold start and every app-resume refresh — status === 'active' on
// /me is the authoritative approval signal, confirmed against a real
// response (there is no provider_profile.is_verified, despite earlier
// backend guidance). The FCM push is just the fast path, not guaranteed.
const refreshCurrentUser = async () => {
  const {data} = await getCurrentUser();
  store.dispatch(
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role as 'customer' | 'provider',
    }),
  );

  const wasVerified = store.getState().provider.isVerified;
  const isVerified = data.user.status === 'active';
  store.dispatch(setVerified(isVerified));
  if (data.user.role === 'provider' && isVerified && !wasVerified) {
    resetToProviderStack();
  }
};

const AppInner = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Session lives in the native cookie jar (withCredentials), not in
    // AsyncStorage — so restoring on cold start means asking the backend
    // whether that cookie is still valid, via GET /me. A 401 here just means
    // "not logged in" (or the session expired), not an error to surface.
    refreshCurrentUser()
      .then(() => registerDeviceToken())
      .catch(() => {
        store.dispatch(logout());
      })
      .finally(() => setHydrated(true));

    // Warm up location permission + the location manager as early as
    // possible, so by the time the user opens a location-dependent screen
    // (Request Help, Go Online) the fix is already cached and instant.
    warmUpLocation();

    // Foreground / background-tap / quit-tap listeners for the
    // provider_approved push — navigates straight to ProviderStack.
    let cleanup: (() => void) | undefined;
    setUpPushNavigation().then(unsubscribe => {
      cleanup = unsubscribe;
    });

    // Re-check /me every time the app comes back to the foreground — the
    // push can be missed (killed app, no data payload, etc.), so this is
    // the reliable catch-up per the backend team's guidance.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && store.getState().auth.isAuthenticated) {
        refreshCurrentUser().catch(() => {});
      }
    });

    return () => {
      cleanup?.();
      subscription.remove();
    };
  }, []);

  // Don't render navigation until we've checked storage
  if (!hydrated) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigation />
    </NavigationContainer>
  );
};

const App = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <AppInner />
    </View>
  </Provider>
);

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default App;
