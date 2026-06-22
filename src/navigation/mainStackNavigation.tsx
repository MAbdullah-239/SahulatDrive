import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabNavigation from './bottomTabNavigation';
import RequestHelp from '../screens/main/requestHelp/RequestHelp';
import BookWorkshop from '../screens/main/bookWorkshop/BookWorkshop';
import AiDiagnosis from '../screens/main/aiDiagnosis/AiDiagnosis';
import {MainStack as MainStackConstants} from '../constants/stack/mainStack/mainStack';

export type MainStackParamList = {
  MainTabs: undefined;
  RequestHelp: undefined;
  BookWorkshop: undefined;
  AiDiagnosis: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      {/* Bottom tab root — replaces the old "Home" entry point */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigation} />

      {/* Full-screen modal-style stack screens pushed from Home tab */}
      <Stack.Screen
        name={MainStackConstants.nestedScreens.RequestHelp.name}
        component={RequestHelp}
      />
      <Stack.Screen
        name={MainStackConstants.nestedScreens.BookWorkshop.name}
        component={BookWorkshop}
      />
      <Stack.Screen
        name={MainStackConstants.nestedScreens.AiDiagnosis.name}
        component={AiDiagnosis}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigation;
