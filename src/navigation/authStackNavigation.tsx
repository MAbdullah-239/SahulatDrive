import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import Signup from '../screens/authentication/signup/signup';
import OtpScreen from '../screens/authentication/otp/OtpScreen';
import {AuthStack as AuthStackConstants} from '../constants/stack/authStack/authStack';

export type RootStackParamList = {
  Onboarding: undefined;
  Signup: undefined;
  VerifyOTP: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={AuthStackConstants.nestedScreens.Onboarding.name}
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
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
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
