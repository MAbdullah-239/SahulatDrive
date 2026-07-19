import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../generalStyles/colors';
import {FontFamily} from '../generalStyles/generalFonts';
import {Home, Briefcase, DollarSign, User} from 'lucide-react-native';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../utils/helpers';
import {Fonts} from '../generalStyles/fontStyles';

import ProviderHome from '../screens/main/providerScreens/ProviderHome';
import ProviderJobsHistory from '../screens/main/providerScreens/ProviderJobsHistory';
import ProviderEarnings from '../screens/main/providerScreens/ProviderEarnings';
import ProviderProfile from '../screens/main/providerScreens/ProviderProfile';

export type ProviderTabParamList = {
  ProviderHomeTab: undefined;
  ProviderJobsTab: undefined;
  ProviderEarningsTab: undefined;
  ProviderProfileTab: undefined;
};

const Tab = createBottomTabNavigator<ProviderTabParamList>();

const ACTIVE = '#E8490F';
const INACTIVE = '#FFFFFF';

const ProviderBottomTabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="ProviderHomeTab"
        component={ProviderHome}
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
        name="ProviderJobsTab"
        component={ProviderJobsHistory}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <Briefcase
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                Jobs
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProviderEarningsTab"
        component={ProviderEarnings}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabItem}>
              <DollarSign
                size={22}
                color={focused ? ACTIVE : INACTIVE}
                strokeWidth={focused ? 2.2 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                Earnings
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProviderProfileTab"
        component={ProviderProfile}
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

export default ProviderBottomTabNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0F',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: HEIGHT_BASE_RATIO(100),
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
