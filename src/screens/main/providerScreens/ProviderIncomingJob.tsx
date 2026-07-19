import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {
  MapPin,
  Clock,
  Star,
  Phone,
  X,
  CheckCircle,
  Navigation2,
  AlertTriangle,
} from 'lucide-react-native';

// Mock incoming job data
const MOCK_JOB = {
  id: 'req_001',
  customerName: 'Ahmed Raza',
  customerRating: 4.6,
  serviceType: 'battery_jump',
  serviceLabel: 'Battery Jump Start',
  serviceIcon: '🔋',
  serviceColor: '#F59E0B',
  location: 'Canal Road, near Kalma Chowk, Lahore',
  distance: '1.4 km',
  estimatedMinutes: 8,
  notes: "Car won't start at all. Tried manual start twice.",
  price: 'PKR 800',
  timeAgo: 'Just now',
};

const COUNTDOWN_SECONDS = 30;

const ProviderIncomingJob: React.FC = () => {
  const navigation = useNavigation<any>();
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [accepted, setAccepted] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Slide in + scale on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, scaleAnim]);

  // Pulse animation on the accept button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.06, duration: 600, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      ]),
    ).start();
  }, [pulseAnim]);

  // Countdown timer
  useEffect(() => {
    if (accepted) return;
    if (timeLeft <= 0) {
      Alert.alert('Job Expired', 'This job request has expired.');
      navigation.goBack();
      return;
    }
    const id = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, accepted]);

  const progressWidth = `${(timeLeft / COUNTDOWN_SECONDS) * 100}%`;
  const isUrgent = timeLeft <= 10;

  const handleAccept = () => {
    setAccepted(true);
    Alert.alert('Job Accepted! 🎉', 'Navigate to the customer now.', [
      {
        text: 'Open Map',
        onPress: () => {
          navigation.navigate('ProviderActiveJob');
        },
      },
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Decline Job?', 'The request will be sent to another provider.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const slideY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      {/* ── Urgent Alert Banner ── */}
      {isUrgent && (
        <View style={styles.urgentBanner}>
          <AlertTriangle size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.urgentBannerText}>
            Job expires in {timeLeft}s — Respond now!
          </Text>
        </View>
      )}

      <Animated.ScrollView
        style={[
          styles.scroll,
          {
            opacity: slideAnim,
            transform: [{translateY: slideY}, {scale: scaleAnim}],
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.topRow}>
          <View style={styles.newJobBadge}>
            <View style={styles.newJobDot} />
            <Text style={styles.newJobText}>New Job Request</Text>
          </View>
          <Text style={styles.timeAgo}>{MOCK_JOB.timeAgo}</Text>
        </View>

        {/* ── Countdown Bar ── */}
        <View style={styles.countdownBar}>
          <View
            style={[
              styles.countdownFill,
              {
                width: progressWidth as any,
                backgroundColor: isUrgent ? '#EA4335' : '#E8490F',
              },
            ]}
          />
        </View>
        <View style={styles.countdownRow}>
          <Clock size={13} color={isUrgent ? '#EA4335' : Colors.GreyText} strokeWidth={2} />
          <Text
            style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
            {timeLeft}s to respond
          </Text>
        </View>

        {/* ── Service Type Card ── */}
        <View style={[styles.serviceCard, {borderColor: MOCK_JOB.serviceColor + '40'}]}>
          <View style={[styles.serviceIconWrap, {backgroundColor: MOCK_JOB.serviceColor + '18'}]}>
            <Text style={styles.serviceIcon}>{MOCK_JOB.serviceIcon}</Text>
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>{MOCK_JOB.serviceLabel}</Text>
            <Text style={[styles.serviceCategory, {color: MOCK_JOB.serviceColor}]}>
              {MOCK_JOB.serviceType}
            </Text>
          </View>
          <Text style={styles.servicePrice}>{MOCK_JOB.price}</Text>
        </View>

        {/* ── Customer Info ── */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerInitials}>AR</Text>
            <View style={styles.verifiedDot} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{MOCK_JOB.customerName}</Text>
            <View style={styles.ratingRow}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
              <Text style={styles.ratingText}>{MOCK_JOB.customerRating}</Text>
              <Text style={styles.ratingLabel}>Customer rating</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
            <Phone size={18} color="#10B981" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Location ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <MapPin size={16} color="#E8490F" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Customer Location</Text>
              <Text style={styles.infoValue}>{MOCK_JOB.location}</Text>
            </View>
          </View>

          <View style={styles.infoSep} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Navigation2 size={16} color="#3B82F6" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Distance from you</Text>
              <Text style={styles.infoValue}>
                {MOCK_JOB.distance} · ~{MOCK_JOB.estimatedMinutes} min away
              </Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {MOCK_JOB.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Customer Notes</Text>
            <Text style={styles.notesText}>{MOCK_JOB.notes}</Text>
          </View>
        )}

        {/* Matching rule reminder */}
        <View style={styles.ruleCard}>
          <CheckCircle size={14} color="#10B981" strokeWidth={2} />
          <Text style={styles.ruleText}>
            This job matches your <Text style={styles.ruleBold}>battery_jump</Text> service category
          </Text>
        </View>

        <View style={{height: 110}} />
      </Animated.ScrollView>

      {/* ── Bottom Action Buttons ── */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={handleDecline}
          activeOpacity={0.8}>
          <X size={20} color={Colors.GreyText} strokeWidth={2.5} />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>

        <Animated.View style={{flex: 1, transform: [{scale: pulseAnim}]}}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={handleAccept}
            activeOpacity={0.85}>
            <CheckCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.acceptBtnText}>Accept Job</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default ProviderIncomingJob;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EA4335',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  urgentBannerText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 20},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newJobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(232,73,15,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.25)',
  },
  newJobDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8490F'},
  newJobText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: '#E8490F',
  },
  timeAgo: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
  },
  countdownBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  countdownFill: {
    height: '100%',
    borderRadius: 2,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  countdownText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
  },
  countdownTextUrgent: {color: '#EA4335', fontFamily: FontFamily.UrbanistBold},
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    gap: 14,
    marginBottom: 14,
  },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIcon: {fontSize: 26},
  serviceInfo: {flex: 1},
  serviceLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    marginBottom: 4,
  },
  serviceCategory: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
  },
  servicePrice: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    gap: 14,
    marginBottom: 14,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  customerInitials: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: Colors.bgColor,
  },
  customerInfo: {flex: 1},
  customerName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 4,
  },
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  ratingText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
  },
  ratingLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  infoRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  infoSep: {height: 1, backgroundColor: 'rgba(255,255,255,0.05)'},
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {flex: 1, paddingTop: 2},
  infoLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
    marginBottom: 3,
  },
  infoValue: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.White,
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 14,
  },
  notesLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.White,
    lineHeight: 22,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
    padding: 12,
  },
  ruleText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
  },
  ruleBold: {fontFamily: FontFamily.UrbanistBold, color: '#10B981'},
  bottomContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
    backgroundColor: Colors.bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  declineBtn: {
    width: 100,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  declineBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.GreyText,
  },
  acceptBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#10B981',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  acceptBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
