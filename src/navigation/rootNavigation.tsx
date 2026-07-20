import React, {useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStackNavigation from './authStackNavigation';
import MainStackNavigation from './mainStackNavigation';
import ProviderStackNavigation from './providerStackNavigation';
import SplashScreen from '../screens/splash/SplashScreen';
import {useAppSelector} from '../redux/hooks';

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
  ProviderStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  const [splashDone, setSplashDone] = useState(false);
  const {isAuthenticated, user} = useAppSelector(state => state.auth);
  const {isVerified} = useAppSelector(state => state.provider);

  /* Show splash first on every cold start */
  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  const isUnapprovedProvider =
    isAuthenticated && user?.role === 'provider' && !isVerified;

  /* After splash: decide initial route based on persisted auth */
  const initialRoute: keyof RootStackParamList =
    isAuthenticated && user?.role === 'provider'
      ? isVerified
        ? 'ProviderStack'
        : 'AuthStack'
      : isAuthenticated && user?.role === 'customer'
      ? 'MainStack'
      : 'AuthStack';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{headerShown: false}}>
      <Stack.Screen name="AuthStack">
        {() => (
          <AuthStackNavigation
            initialRouteName={
              isUnapprovedProvider ? 'ProviderPendingApproval' : undefined
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MainStack" component={MainStackNavigation} />
      <Stack.Screen name="ProviderStack" component={ProviderStackNavigation} />
    </Stack.Navigator>
  );
};

export default RootNavigation;
