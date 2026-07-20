/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Must be registered outside the component tree, before the app itself
// mounts — this is what lets RNFB wake the app to process a data message
// while it's backgrounded/killed (the notification tray display itself is
// handled by the OS regardless of this handler).
messaging().setBackgroundMessageHandler(async () => {});

AppRegistry.registerComponent(appName, () => App);
