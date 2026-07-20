import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {Clock, CheckCircle, Shield, Bell} from 'lucide-react-native';
import {getCurrentUser, getNotifications} from '../../../requestHandler/api';
import {useAppDispatch} from '../../../redux/hooks';
import {setVerified} from '../../../redux/slices/providerSlice';

const APPROVAL_POLL_INTERVAL_MS = 8000;

const STEPS = [
  {label: 'Documents received', done: true, icon: CheckCircle, color: '#10B981'},
  {label: 'Identity verification', done: false, icon: Shield, color: '#F59E0B'},
  {label: 'Background check', done: false, icon: Clock, color: '#3B82F6'},
  {label: 'Account activated', done: false, icon: Bell, color: '#E8490F'},
];

const ProviderPendingApproval: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  // Pulse animation for the waiting indicator
  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();
  }, [pulse, rotate]);

  // status === 'active' on /me is the authoritative field, confirmed against
  // a real response (there is no provider_profile.is_verified, despite
  // earlier backend guidance) — check that first. The notifications check is
  // a secondary signal in case /me is ever stale, and the FCM push (see
  // setUpPushNavigation) may fire faster than either, but can't be trusted
  // alone since some approval pushes only carry a display "notification"
  // block with no "data" payload to match on.
  useEffect(() => {
    let cancelled = false;

    const checkApproval = async () => {
      try {
        const {data: meData} = await getCurrentUser();
        const isVerified = meData.user.status === 'active';
        dispatch(setVerified(isVerified));
        if (isVerified) {
          if (!cancelled) {
            navigation.reset({index: 0, routes: [{name: 'ProviderStack'}]});
          }
          return;
        }

        const {data: notifData} = await getNotifications();
        const approvedViaNotification = notifData.notifications.some(n =>
          n.title.toLowerCase().includes('verified'),
        );
        if (approvedViaNotification && !cancelled) {
          dispatch(setVerified(true));
          navigation.reset({index: 0, routes: [{name: 'ProviderStack'}]});
        }
      } catch {
        // Network hiccup — next poll tick will retry.
      }
    };

    checkApproval();
    const interval = setInterval(checkApproval, APPROVAL_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [navigation]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      <View style={styles.container}>
        {/* ── Animated Icon ── */}
        <View style={styles.iconArea}>
          <Animated.View
            style={[styles.outerRing, {transform: [{rotate: spin}]}]}>
            <View style={styles.outerRingDash} />
          </Animated.View>
          <Animated.View
            style={[styles.innerCircle, {transform: [{scale: pulse}]}]}>
            <Text style={styles.iconEmoji}>⏳</Text>
          </Animated.View>
        </View>

        {/* ── Title ── */}
        <Text style={styles.title}>Under Review</Text>
        <Text style={styles.subtitle}>
          Your application is being reviewed by the{'\n'}Sahulat Drive admin team.
          This usually takes{'\n'}
          <Text style={styles.highlight}>24–48 hours.</Text>
        </Text>

        {/* ── Review Steps ── */}
        <View style={styles.stepsCard}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <View key={step.label} style={styles.stepRow}>
                <View style={styles.stepLeftCol}>
                  <View
                    style={[
                      styles.stepIconWrap,
                      {
                        backgroundColor: step.done
                          ? `${step.color}18`
                          : 'rgba(255,255,255,0.05)',
                      },
                    ]}>
                    <Icon
                      size={16}
                      color={step.done ? step.color : Colors.GreyText}
                      strokeWidth={2}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepConnector,
                        step.done && {backgroundColor: step.color},
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepLabel,
                      step.done && {color: Colors.White},
                    ]}>
                    {step.label}
                  </Text>
                  {step.done ? (
                    <Text style={[styles.stepStatus, {color: step.color}]}>
                      ✓ Completed
                    </Text>
                  ) : (
                    <Text style={styles.stepStatus}>Pending...</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── What happens next ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔔</Text>
          <Text style={styles.infoText}>
            You'll receive a notification once your account is approved. Until
            then, you cannot go online or receive job requests.
          </Text>
        </View>

        {/* ── Blocking rule from backend ── */}
        <View style={styles.ruleBox}>
          <Text style={styles.ruleText}>
            Until admin approval, you will not be able to go online or appear in
            matching results.
          </Text>
        </View>

        {/* ── Contact Support ── */}
        <TouchableOpacity style={styles.supportBtn} activeOpacity={0.7}>
          <Text style={styles.supportBtnText}>Contact Support</Text>
        </TouchableOpacity>

        {/* ── Enter Provider Dashboard (simulates admin approval) ── */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'ProviderStack'}]})
          }>
          <Text style={styles.dashboardBtnText}>Enter Provider Dashboard →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderPendingApproval;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    alignItems: 'center',
  },
  iconArea: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(232,73,15,0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRingDash: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8490F',
    position: 'absolute',
    top: 0,
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(232,73,15,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {fontSize: 38},
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 28,
    color: Colors.White,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  highlight: {
    fontFamily: FontFamily.UrbanistBold,
    color: '#E8490F',
  },
  stepsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    marginBottom: 18,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },
  stepLeftCol: {
    alignItems: 'center',
    width: 36,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 1,
    marginBottom: 2,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 14,
  },
  stepLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.GreyText,
    marginBottom: 2,
  },
  stepStatus: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  infoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(59,130,246,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    padding: 14,
    marginBottom: 14,
  },
  infoIcon: {fontSize: 16},
  infoText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 20,
  },
  ruleBox: {
    width: '100%',
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  ruleText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 20,
    textAlign: 'center',
  },
  supportBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 14,
  },
  supportBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 15,
    color: Colors.White,
  },
  dashboardBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 5},
    elevation: 7,
  },
  dashboardBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
