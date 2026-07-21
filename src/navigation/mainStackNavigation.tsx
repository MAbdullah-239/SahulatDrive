import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabNavigation from './bottomTabNavigation';
import RequestHelp from '../screens/main/requestHelp/RequestHelp';
import BookWorkshop from '../screens/main/bookWorkshop/BookWorkshop';
import AiDiagnosis from '../screens/main/aiDiagnosis/AiDiagnosis';
import VoiceAssistant from '../screens/main/voiceAssistant/VoiceAssistant';
import MechanicWorkshopDetail from '../screens/main/mechanicDetail/MechanicWorkshopDetail';
import LiveTrackingScreen from '../screens/main/liveTracking/LiveTrackingScreen';
import {MainStack as MainStackConstants} from '../constants/stack/mainStack/mainStack';
import {DetailParams} from '../screens/main/mechanicDetail/MechanicWorkshopDetail';

export type MainStackParamList = {
  MainTabs: undefined;
  RequestHelp: undefined;
  BookWorkshop: undefined;
  AiDiagnosis: undefined;
  VoiceAssistant: undefined;
  MechanicWorkshopDetail: {item: DetailParams};
  LiveTracking: {requestId: string};
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
      <Stack.Screen
        name={MainStackConstants.nestedScreens.VoiceAssistant.name}
        component={VoiceAssistant}
      />
      <Stack.Screen
        name="MechanicWorkshopDetail"
        component={MechanicWorkshopDetail}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name={MainStackConstants.nestedScreens.LiveTracking.name}
        component={LiveTrackingScreen}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigation;
