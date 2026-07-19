import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProviderStackParamList} from '../../../navigation/providerStackNavigation';
import {
  MapPin,
  Phone,
  Navigation2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Compass,
  MessageSquare,
} from 'lucide-react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';

const MOCK_ACTIVE_JOB = {
  id: 'req_001',
  customerName: 'Ahmed Raza',
  customerPhone: '+92 311 2345678',
  customerRating: 4.6,
  serviceType: 'battery_jump',
  serviceLabel: 'Battery Jump Start',
  serviceIcon: '🔋',
  location: 'Canal Road, near Kalma Chowk, Lahore',
  customerCoords: {latitude: 31.5204, longitude: 74.3587},
  providerCoords: {latitude: 31.5154, longitude: 74.3527},
  distance: '1.4 km',
  eta: '8 mins',
  price: 'PKR 800',
  notes: "Car won't start at all. Battery warning light was red.",
};

const STEPS = ['accepted', 'arrived', 'started', 'completed'];

const ProviderActiveJob: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList>>();
  const route = useRoute<any>();
  const [jobStatus, setJobStatus] = useState<'accepted' | 'arrived' | 'started' | 'completed'>('accepted');

  const advanceStatus = () => {
    if (jobStatus === 'accepted') {
      setJobStatus('arrived');
      Alert.alert('Status Updated', 'You have arrived at the customer location.');
    } else if (jobStatus === 'arrived') {
      setJobStatus('started');
      Alert.alert('Job Started', 'You have started working on the vehicle.');
    } else if (jobStatus === 'started') {
      setJobStatus('completed');
      Alert.alert('Job Completed! 🎉', 'Payment of PKR 800 received.', [
        {
          text: 'Go Home',
          onPress: () =>
            navigation.reset({index: 0, routes: [{name: 'ProviderTabs'}]}),
        },
      ]);
    }
  };

  const cancelJob = () => {
    Alert.alert(
      'Cancel Job?',
      'Are you sure you want to cancel? This will affect your rating.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () =>
            navigation.reset({index: 0, routes: [{name: 'ProviderTabs'}]}),
        },
      ],
    );
  };

  const getStatusButtonText = () => {
    switch (jobStatus) {
      case 'accepted':
        return 'Mark as Arrived';
      case 'arrived':
        return 'Start Work';
      case 'started':
        return 'Complete Job & Payment';
      default:
        return 'Completed';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Map ── */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        initialRegion={{
          latitude: 31.5179,
          longitude: 74.3557,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}>
        {/* Customer Marker */}
        <Marker coordinate={MOCK_ACTIVE_JOB.customerCoords}>
          <View style={styles.customerMarker}>
            <Text style={styles.markerEmoji}>🚗</Text>
          </View>
        </Marker>

        {/* Provider Marker */}
        <Marker coordinate={MOCK_ACTIVE_JOB.providerCoords}>
          <View style={styles.providerMarker}>
            <Text style={styles.markerEmoji}>🔧</Text>
          </View>
        </Marker>

        {/* Route line */}
        <Polyline
          coordinates={[MOCK_ACTIVE_JOB.providerCoords, MOCK_ACTIVE_JOB.customerCoords]}
          strokeColor="#E8490F"
          strokeWidth={4}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        {/* Floating Top Header */}
        <View style={styles.topBanner}>
          <View style={styles.topBannerLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.topBannerTitle}>
              {jobStatus === 'accepted' && 'En Route to Customer'}
              {jobStatus === 'arrived' && 'Arrived at Location'}
              {jobStatus === 'started' && 'Service in Progress'}
            </Text>
          </View>
          <Text style={styles.etaText}>{MOCK_ACTIVE_JOB.eta}</Text>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        {/* ── Active Job Sheet ── */}
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          pointerEvents="box-none">

          <View style={styles.sheetCard}>
            <View style={styles.dragIndicator} />

            {/* Customer Contact Panel */}
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <Text style={styles.avatarText}>AR</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{MOCK_ACTIVE_JOB.customerName}</Text>
                <View style={styles.ratingRow}>
                  <Compass size={12} color={Colors.GreyText} strokeWidth={2} />
                  <Text style={styles.distanceText}>{MOCK_ACTIVE_JOB.distance} away</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <MessageSquare size={18} color="#E8490F" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} activeOpacity={0.7}>
                  <Phone size={18} color="#10B981" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Service Category */}
            <View style={styles.serviceBox}>
              <Text style={styles.serviceIcon}>{MOCK_ACTIVE_JOB.serviceIcon}</Text>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>{MOCK_ACTIVE_JOB.serviceLabel}</Text>
                <Text style={styles.serviceSub}>{MOCK_ACTIVE_JOB.price} · Cash Payment</Text>
              </View>
            </View>

            {/* Location Address */}
            <View style={styles.addressBox}>
              <MapPin size={16} color="#E8490F" strokeWidth={2} />
              <Text style={styles.addressText} numberOfLines={2}>
                {MOCK_ACTIVE_JOB.location}
              </Text>
            </View>

            {/* Customer Notes */}
            {MOCK_ACTIVE_JOB.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>Customer Notes</Text>
                <Text style={styles.notesText}>{MOCK_ACTIVE_JOB.notes}</Text>
              </View>
            )}

            {/* Stepper Display */}
            <View style={styles.stepper}>
              {STEPS.slice(0, 3).map((step, idx) => {
                const isCurrent = jobStatus === step;
                const isDone = STEPS.indexOf(jobStatus) > idx;
                return (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepNode,
                        isDone && styles.stepNodeDone,
                        isCurrent && styles.stepNodeCurrent,
                      ]}>
                      {isDone ? (
                        <CheckCircle size={12} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <View
                          style={[
                            styles.stepInnerDot,
                            isCurrent && {backgroundColor: '#E8490F'},
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        (isCurrent || isDone) && styles.stepLabelActive,
                      ]}>
                      {step === 'accepted' ? 'Accepted' : step === 'arrived' ? 'Arrived' : 'In Progress'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.footerButtons}>
              {jobStatus !== 'started' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={cancelJob}
                  activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  jobStatus === 'started' && styles.submitBtnComplete,
                ]}
                onPress={advanceStatus}
                activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>{getStatusButtonText()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProviderActiveJob;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111214'},
  safeArea: {flex: 1, zIndex: 1},
  customerMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  providerMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8490F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerEmoji: {fontSize: 18},
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1013',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 44 : 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  topBannerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8490F',
  },
  topBannerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
  },
  etaText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#E8490F',
  },
  spacer: {flex: 1},
  sheetScroll: {maxHeight: 440},
  sheetContent: {paddingHorizontal: 16, paddingBottom: 16},
  sheetCard: {
    backgroundColor: '#0A0A0F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 16,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  customerInfo: {flex: 1},
  customerName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 4,
  },
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  distanceText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
  },
  actionButtons: {flexDirection: 'row', gap: 8},
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  serviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  serviceIcon: {fontSize: 22},
  serviceInfo: {flex: 1},
  serviceLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
    marginBottom: 2,
  },
  serviceSub: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  addressText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.White,
    flex: 1,
  },
  notesBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  notesTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 12,
    color: Colors.GreyText,
    marginBottom: 4,
  },
  notesText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.White,
    lineHeight: 18,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  stepItem: {alignItems: 'center', flex: 1},
  stepNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#0A0A0F',
  },
  stepNodeDone: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  stepNodeCurrent: {
    borderColor: '#E8490F',
  },
  stepInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  stepLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  stepLabelActive: {
    color: Colors.White,
    fontFamily: FontFamily.UrbanistBold,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.GreyText,
  },
  submitBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#E8490F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  submitBtnComplete: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  submitBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
