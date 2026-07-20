import {resetToProviderStack} from '../navigation/navigationRef';

// The backend sends {data: {type: 'provider_approved'}} on the FCM push
// fired when an admin approves a provider (see admin/providers/approve).
// Foreground, background-tap, and quit-state-tap all need separate
// listeners per the RNFB messaging API — none of them overlap.
const handleRemoteMessage = (remoteMessage: {
  data?: {[key: string]: string | object};
}) => {
  if (remoteMessage.data?.type === 'provider_approved') {
    resetToProviderStack();
  }
};

export const setUpPushNavigation = async () => {
  try {
    const messaging = (await import('@react-native-firebase/messaging'))
      .default;

    // App in foreground when the push arrives.
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      handleRemoteMessage(remoteMessage);
    });

    // App in background, user taps the notification.
    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        handleRemoteMessage(remoteMessage);
      },
    );

    // App was quit, user taps the notification that launched it.
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
      handleRemoteMessage(initialMessage);
    }

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  } catch {
    // Firebase not configured for this build — non-fatal.
    return () => {};
  }
};
