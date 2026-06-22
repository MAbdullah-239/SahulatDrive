import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../generalStyles/colors';
import {FontFamily} from '../generalStyles/generalFonts';
import {Home, Compass, ClipboardList, User} from 'lucide-react-native';

import HomeScreen from '../screens/main/home/home';
import Explore from '../screens/main/explore/Explore';
import History from '../screens/main/history/History';
import Profile from '../screens/main/profile/Profile';
import {FONT_SIZE, HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../utils/helpers';
import {Fonts} from '../generalStyles/fontStyles';

export type BottomTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const ACTIVE = '#E8490F';
const INACTIVE = '#FFFFFF';

const BottomTabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <Home
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                Home
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ExploreTab"
        component={Explore}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <Compass
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                Explore
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="HistoryTab"
        component={History}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <ClipboardList
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                History
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <User
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0F',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,

    height: HEIGHT_BASE_RATIO(100),
    // paddingBottom: HEIGHT_BASE_RATIO(8),
    paddingTop: HEIGHT_BASE_RATIO(30),

    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: -6},
  },

  tabItem: {
    width: WIDTH_BASE_RATIO(70),
    alignItems: 'center',
    justifyContent: 'center',
    gap: WIDTH_BASE_RATIO(4),
  },

  tabLabel: {
    ...Fonts.Urbanist_Regular_12_White,
  },

  tabLabelActive: {
    color: ACTIVE,
    fontFamily: FontFamily.UrbanistBold,
  },

  tabLabelInactive: {
    color: INACTIVE,
  },
});
