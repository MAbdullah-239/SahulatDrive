import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/main/home/home';
import RequestHelp from '../screens/main/requestHelp/RequestHelp';
import BookWorkshop from '../screens/main/bookWorkshop/BookWorkshop';
import AiDiagnosis from '../screens/main/aiDiagnosis/AiDiagnosis';
import {MainStack as MainStackConstants} from '../constants/stack/mainStack/mainStack';

export type MainStackParamList = {
  Home: undefined;
  RequestHelp: undefined;
  BookWorkshop: undefined;
  AiDiagnosis: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={MainStackConstants.nestedScreens.Home.name}
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen
        name={MainStackConstants.nestedScreens.Home.name}
        component={Home}
      />
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
