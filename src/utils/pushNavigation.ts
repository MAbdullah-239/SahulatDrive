import {resetToProviderStack} from '../navigation/navigationRef';
import {getCurrentUser} from '../requestHandler/api';

// The backend sends {data: {type: 'provider_approved'}} on the FCM push
// fired when an admin approves a provider (see admin/providers/approve).
// Foreground, background-tap, and quit-state-tap all need separate
// listeners per the RNFB messaging API — none of them overlap.
//
// The push payload's "type" field is trusted for WHAT happened, but never
// for whether it still applies to whoever is logged in on this device right
// now (a stale/misattributed FCM token, or a fast logout/login switch,
// could otherwise let an unapproved provider ride someone else's push
// straight past the approval gate) — so this re-checks the real /me status
// before ever resetting to ProviderStack, exactly like the poll on
// ProviderPendingApproval does.
const handleRemoteMessage = async (remoteMessage: {
  data?: {[key: string]: string | object};
}) => {
  if (remoteMessage.data?.type !== 'provider_approved') return;
  try {
    const {data} = await getCurrentUser();
    if (data.user.status === 'active') {
      resetToProviderStack();
    }
  } catch {
    // Session/network hiccup — the regular approval poll will catch up.
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
