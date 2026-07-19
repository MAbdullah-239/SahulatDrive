import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import Signup from '../screens/authentication/signup/signup';
import OtpScreen from '../screens/authentication/otp/OtpScreen';
import ProviderSelectServices from '../screens/authentication/providerOnboarding/ProviderSelectServices';
import ProviderAddTowTruck from '../screens/authentication/providerOnboarding/ProviderAddTowTruck';
import ProviderUploadDocuments from '../screens/authentication/providerOnboarding/ProviderUploadDocuments';
import ProviderPendingApproval from '../screens/authentication/providerOnboarding/ProviderPendingApproval';
import {AuthStack as AuthStackConstants} from '../constants/stack/authStack/authStack';

export type RootStackParamList = {
  Onboarding: undefined;
  Signup: undefined;
  VerifyOTP: {role?: 'customer' | 'provider'};
  ProviderSelectServices: {role?: string};
  ProviderAddTowTruck: {categories: string[]};
  ProviderUploadDocuments: {categories: string[]; towTruck?: object};
  ProviderPendingApproval: {categories: string[]};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={AuthStackConstants.nestedScreens.Onboarding.name}
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>

      {/* ── Core Auth ── */}
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.Onboarding.name}
        component={OnboardingScreen}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.Signup.name}
        component={Signup}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.VerifyOTP.name}
        component={OtpScreen}
      />

      {/* ── Provider Onboarding Flow ── */}
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ProviderSelectServices.name}
        component={ProviderSelectServices}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ProviderAddTowTruck.name}
        component={ProviderAddTowTruck}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ProviderUploadDocuments.name}
        component={ProviderUploadDocuments}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ProviderPendingApproval.name}
        component={ProviderPendingApproval}
        options={{gestureEnabled: false}} // Can't swipe back from pending approval
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
