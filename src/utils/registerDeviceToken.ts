import {Platform} from 'react-native';
import {updateDeviceToken} from '../requestHandler/api';

// Call right after login / OTP verification succeeds, once the session
// cookie is set. Dynamically imports @react-native-firebase/messaging so a
// build without the native Firebase config files (GoogleService-Info.plist /
// google-services.json) doesn't crash — push registration just silently
// no-ops in that case.
export const registerDeviceToken = async () => {
  try {
    const messaging = (await import('@react-native-firebase/messaging'))
      .default;

    // iOS (and Android 13+) require explicit permission before getToken()
    // will resolve with a real token — without this it throws/rejects and
    // push registration silently never reaches the backend.
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      console.warn('[Push] Notification permission denied, skipping FCM registration');
      return;
    }

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await updateDeviceToken(fcmToken).catch(err => {
        console.warn('[Push] Failed to register FCM token with backend', err);
      });
    } else {
      console.warn('[Push] getToken() returned no token');
    }
  } catch (err) {
    console.warn('[Push] Failed to set up FCM registration', err);
  }
};
