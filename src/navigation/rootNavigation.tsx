import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStackNavigation from './authStackNavigation';
import MainStackNavigation from './mainStackNavigation';
import {AuthStack} from '../constants/stack/authStack/authStack';
import {MainStack} from '../constants/stack/mainStack/mainStack';

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthStack"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={AuthStack.name}
        component={AuthStackNavigation}
      />
      <Stack.Screen
        name={MainStack.name}
        component={MainStackNavigation}
      />
    </Stack.Navigator>
  );
};

export default RootNavigation;
