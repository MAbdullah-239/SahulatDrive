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

export type BottomTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const ACTIVE = '#E8490F';
const INACTIVE = '#4A4A55';

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
              <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
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
              <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
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
              <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
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
              <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
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
    height: Platform.OS === 'ios' ? 86 : 68,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 8,
    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: -6},
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FontFamily.UrbanistMedium,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: ACTIVE,
    fontFamily: FontFamily.UrbanistBold,
  },
  tabLabelInactive: {
    color: INACTIVE,
  },
});
