import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProviderBottomTabNavigation from './providerBottomTabNavigation';
import ProviderIncomingJob from '../screens/main/providerScreens/ProviderIncomingJob';
import ProviderActiveJob from '../screens/main/providerScreens/ProviderActiveJob';
import {ProviderStack as ProviderStackConstants} from '../constants/stack/providerStack/providerStack';

export type ProviderStackParamList = {
  ProviderTabs: undefined;
  ProviderIncomingJob: undefined;
  ProviderActiveJob: undefined;
};

const Stack = createNativeStackNavigator<ProviderStackParamList>();

const ProviderStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProviderTabs"
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="ProviderTabs" component={ProviderBottomTabNavigation} />
      <Stack.Screen
        name={ProviderStackConstants.nestedScreens.ProviderIncomingJob.name}
        component={ProviderIncomingJob}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name={ProviderStackConstants.nestedScreens.ProviderActiveJob.name}
        component={ProviderActiveJob}
      />
    </Stack.Navigator>
  );
};

export default ProviderStackNavigation;
