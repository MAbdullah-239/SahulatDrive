import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {store} from './src/redux/store';
import {setUser} from './src/redux/slices/authSlice';
import RootNavigation from './src/navigation/rootNavigation';
import {warmUpLocation} from './src/utils/location';

const AppInner = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Restore auth session from AsyncStorage on cold start
    AsyncStorage.getItem('auth_user')
      .then(raw => {
        if (raw) {
          const user = JSON.parse(raw);
          store.dispatch(setUser(user));
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));

    // Warm up location permission + the location manager as early as
    // possible, so by the time the user opens a location-dependent screen
    // (Request Help, Go Online) the fix is already cached and instant.
    warmUpLocation();
  }, []);

  // Don't render navigation until we've checked storage
  if (!hydrated) return null;

  return (
    <NavigationContainer>
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
