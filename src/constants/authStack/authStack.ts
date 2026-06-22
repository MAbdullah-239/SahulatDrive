import {ComponentType} from 'react';
import AuthNavigationStack from '../../../navigation/authStackNavigation';

import {
  EnterInformation,
  GetStarted,
  name: 'authStack',
  component: AuthNavigationStack,
  initialRouteName: 'GetStarted',

  nestedScreens: {
    GetStarted: {
      name: 'GetStarted' as const,
      component: GetStarted as ComponentType<any>,
    },

