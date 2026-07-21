import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import Signup from '../screens/authentication/signup/signup';
import Login from '../screens/authentication/login/Login';
import OtpScreen from '../screens/authentication/otp/OtpScreen';
import ForgotPasswordScreen from '../screens/authentication/forgotPassword/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/authentication/forgotPassword/ResetPasswordScreen';
import ProviderSelectServices from '../screens/authentication/providerOnboarding/ProviderSelectServices';
import ProviderAddTowTruck from '../screens/authentication/providerOnboarding/ProviderAddTowTruck';
import ProviderAddWorkshop from '../screens/authentication/providerOnboarding/ProviderAddWorkshop';
import ProviderUploadDocuments from '../screens/authentication/providerOnboarding/ProviderUploadDocuments';
import ProviderPendingApproval from '../screens/authentication/providerOnboarding/ProviderPendingApproval';
import {AuthStack as AuthStackConstants} from '../constants/stack/authStack/authStack';

export type RootStackParamList = {
  Onboarding: undefined;
  Signup: undefined;
  Login: undefined;
  VerifyOTP: {role?: 'customer' | 'provider'; phone?: string};
  ForgotPassword: undefined;
  ResetPassword: {login?: string};
  ProviderSelectServices: {role?: string};
  ProviderAddTowTruck: {categories: string[]; needsWorkshop?: boolean};
  ProviderAddWorkshop: {categories: string[]};
  ProviderUploadDocuments: {categories: string[]};
  ProviderPendingApproval: {categories: string[]};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AuthStackNavigationProps {
  initialRouteName?: keyof RootStackParamList;
}

const AuthStackNavigation: React.FC<AuthStackNavigationProps> = ({
  initialRouteName = AuthStackConstants.nestedScreens.Onboarding.name,
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
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
        name={AuthStackConstants.nestedScreens.Login.name}
        component={Login}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.VerifyOTP.name}
        component={OtpScreen}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ForgotPassword.name}
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name={AuthStackConstants.nestedScreens.ResetPassword.name}
        component={ResetPasswordScreen}
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
        name={AuthStackConstants.nestedScreens.ProviderAddWorkshop.name}
        component={ProviderAddWorkshop}
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
