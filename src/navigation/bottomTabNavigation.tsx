import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../generalStyles/colors';
import {FontFamily} from '../generalStyles/generalFonts';

import Home from '../screens/main/home/home';
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

/* ─── Tab Icon Renderer ─────────────────────────────────────── */
const TabIcon = ({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{emoji}</Text>
    <Text
      style={[
        styles.tabLabel,
        focused ? styles.tabLabelActive : styles.tabLabelInactive,
      ]}>
      {label}
    </Text>
  </View>
);

/* ─── Bottom Tab Navigator ──────────────────────────────────── */
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
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={Explore}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🔍" label="Explore" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={History}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="📄" label="History" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgColor,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -4},
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FontFamily.UrbanistMedium,
  },
  tabLabelActive: {
    color: '#E8490F',
    fontFamily: FontFamily.UrbanistBold,
  },
  tabLabelInactive: {
    color: Colors.GreyText,
  },
});
