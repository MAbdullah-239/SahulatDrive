import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from './rootNavigation';

// Lets code outside the component tree (FCM background/quit-state handlers,
// which fire before any screen has mounted) trigger navigation once the
// NavigationContainer has attached this ref.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const resetToProviderStack = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({index: 0, routes: [{name: 'ProviderStack'}]});
  }
};

export const resetToMainStack = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({index: 0, routes: [{name: 'MainStack'}]});
  }
};
