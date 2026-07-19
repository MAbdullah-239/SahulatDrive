import React, {useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStackNavigation from './authStackNavigation';
import MainStackNavigation from './mainStackNavigation';
import ProviderStackNavigation from './providerStackNavigation';
import SplashScreen from '../screens/splash/SplashScreen';
import {AuthStack} from '../constants/stack/authStack/authStack';
import {MainStack} from '../constants/stack/mainStack/mainStack';
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

  /* Show splash first on every cold start */
  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  /* After splash: decide initial route based on persisted auth */
  const initialRoute: keyof RootStackParamList =
    isAuthenticated && user?.role === 'provider'
      ? 'ProviderStack'
      : isAuthenticated && user?.role === 'customer'
      ? 'MainStack'
      : 'AuthStack';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{headerShown: false}}>
      <Stack.Screen name="AuthStack" component={AuthStackNavigation} />
      <Stack.Screen name="MainStack" component={MainStackNavigation} />
      <Stack.Screen name="ProviderStack" component={ProviderStackNavigation} />
    </Stack.Navigator>
  );
};

export default RootNavigation;
