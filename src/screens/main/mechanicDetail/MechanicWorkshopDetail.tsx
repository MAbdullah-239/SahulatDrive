import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../../navigation/mainStackNavigation';
import {MainStack as MainStackConstants} from '../../../constants/stack/mainStack/mainStack';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Wrench,
  Award,
  Briefcase,
  ChevronRight,
  Navigation2,
  Calendar,
} from 'lucide-react-native';
import MapView, {Marker} from 'react-native-maps';

/* ─── Types ─────────────────────────────────────────────────── */
export type DetailType = 'workshop' | 'mechanic';

export interface WorkshopDetailParams {
  type: 'workshop';
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  open: boolean;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  coordinate: {latitude: number; longitude: number};
}

export interface MechanicDetailParams {
  type: 'mechanic';
  id: string;
  name: string;
  rating: number;
  jobs: number;
  specialization: string;
  status: string;
  experience: string;
  phone: string;
  skills: string[];
  coordinate: {latitude: number; longitude: number};
}

export type DetailParams = WorkshopDetailParams | MechanicDetailParams;

/* ─── Star renderer ──────────────────────────────────────────── */
const Stars = ({rating}: {rating: number}) => (
  <View style={styles.starsRow}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={14}
        color="#F59E0B"
        fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'}
        strokeWidth={1.5}
      />
    ))}
    <Text style={styles.ratingNumber}>{rating}</Text>
  </View>
);

/* ─── Service / Skill chip ───────────────────────────────────── */
const Chip = ({label}: {label: string}) => (
  <View style={styles.chip}>
    <CheckCircle size={11} color="#E8490F" strokeWidth={2.5} />
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

/* ─── Main Screen ────────────────────────────────────────────── */
const MechanicWorkshopDetail: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<any>();
  const item: DetailParams = route.params?.item;

  const [bookingPressed, setBookingPressed] = useState(false);

  const isWorkshop = item?.type === 'workshop';
  const isMechanic = item?.type === 'mechanic';

  const ws = isWorkshop ? (item as WorkshopDetailParams) : null;
  const mc = isMechanic ? (item as MechanicDetailParams) : null;

  const isAvailable = isMechanic
    ? mc!.status === 'Available'
    : ws?.open ?? false;

  const handleCall = () => {
    const phone = isWorkshop ? ws!.phone : mc!.phone;
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot open phone', 'Please dial manually.'),
    );
  };

  const handleBookOrRequest = () => {
    setBookingPressed(true);
    if (isWorkshop) {
      navigation.navigate(MainStackConstants.nestedScreens.BookWorkshop.name);
    } else {
      navigation.navigate(MainStackConstants.nestedScreens.RequestHelp.name);
    }
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>No detail data provided.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.White} strokeWidth={2.2} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {isWorkshop ? ws!.name : mc!.name}
        </Text>

        {/* Availability badge */}
        <View
          style={[
            styles.availBadge,
            {
              backgroundColor: isAvailable
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(234,67,53,0.12)',
              borderColor: isAvailable
                ? 'rgba(16,185,129,0.3)'
                : 'rgba(234,67,53,0.3)',
            },
          ]}>
          {isAvailable ? (
            <CheckCircle size={12} color="#10B981" strokeWidth={2.5} />
          ) : (
            <XCircle size={12} color="#EA4335" strokeWidth={2.5} />
          )}
          <Text
            style={[
              styles.availBadgeText,
              {color: isAvailable ? '#10B981' : '#EA4335'},
            ]}>
            {isWorkshop
              ? ws!.open
                ? 'Open'
                : 'Closed'
              : mc!.status}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Map Preview ── */}
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            userInterfaceStyle="dark"
            initialRegion={{
              latitude: item.coordinate.latitude,
              longitude: item.coordinate.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            customMapStyle={mapDarkStyle}>
            <Marker coordinate={item.coordinate}>
              <View style={styles.markerWrap}>
                <View style={styles.markerInner}>
                  {isWorkshop ? (
                    <Wrench size={16} color="#FFFFFF" strokeWidth={2.5} />
                  ) : (
                    <Award size={16} color="#FFFFFF" strokeWidth={2.5} />
                  )}
                </View>
              </View>
            </Marker>
          </MapView>

          {/* Map overlay label */}
          <View style={styles.mapOverlay}>
            <MapPin size={13} color="#E8490F" strokeWidth={2} />
            <Text style={styles.mapOverlayText}>
              {isWorkshop ? ws!.address : `${mc!.specialization} · ${mc!.distance ?? ''}`.replace(' · ', mc!.experience ? ' · ' : '')}
            </Text>
          </View>
        </View>

        {/* ── Identity Card ── */}
        <View style={styles.identityCard}>
          {/* Avatar */}
          <View
            style={[
              styles.avatarBox,
              {
                backgroundColor: isWorkshop
                  ? 'rgba(232,73,15,0.12)'
                  : isAvailable
                  ? 'rgba(16,185,129,0.1)'
                  : 'rgba(232,73,15,0.1)',
              },
            ]}>
            {isWorkshop ? (
              <Wrench size={28} color="#E8490F" strokeWidth={2} />
            ) : (
              <Text style={styles.avatarInitials}>
                {mc!.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            )}
          </View>

          {/* Name + meta */}
          <View style={styles.identityText}>
            <Text style={styles.identityName}>
              {isWorkshop ? ws!.name : mc!.name}
            </Text>

            {isWorkshop && (
              <Text style={styles.identitySubtext}>{ws!.address}</Text>
            )}
            {isMechanic && (
              <Text style={styles.identitySubtext}>{mc!.specialization}</Text>
            )}

            <Stars rating={isWorkshop ? ws!.rating : mc!.rating} />
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {isWorkshop && (
            <>
              <View style={styles.statBox}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.statVal}>{ws!.rating}</Text>
                <Text style={styles.statLbl}>{ws!.reviews} reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <MapPin size={16} color="#10B981" strokeWidth={2} />
                <Text style={styles.statVal}>{ws!.distance}</Text>
                <Text style={styles.statLbl}>Distance</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Clock size={16} color="#3B82F6" strokeWidth={2} />
                <Text
                  style={[
                    styles.statVal,
                    {color: ws!.open ? '#10B981' : '#EA4335'},
                  ]}>
                  {ws!.open ? 'Open' : 'Closed'}
                </Text>
                <Text style={styles.statLbl}>Status</Text>
              </View>
            </>
          )}

          {isMechanic && (
            <>
              <View style={styles.statBox}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.statVal}>{mc!.rating}</Text>
                <Text style={styles.statLbl}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Briefcase size={16} color="#3B82F6" strokeWidth={2} />
                <Text style={styles.statVal}>{mc!.jobs}</Text>
                <Text style={styles.statLbl}>Jobs Done</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Calendar size={16} color="#10B981" strokeWidth={2} />
                <Text style={styles.statVal}>{mc!.experience}</Text>
                <Text style={styles.statLbl}>Experience</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Info rows ── */}
        <View style={styles.infoCard}>
          {isWorkshop && (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Clock size={16} color={Colors.GreyText} strokeWidth={1.8} />
                </View>
                <Text style={styles.infoText}>{ws!.hours}</Text>
              </View>
              <View style={styles.infoSep} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Phone size={16} color={Colors.GreyText} strokeWidth={1.8} />
                </View>
                <Text style={styles.infoText}>{ws!.phone}</Text>
              </View>
              <View style={styles.infoSep} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <MapPin size={16} color={Colors.GreyText} strokeWidth={1.8} />
                </View>
                <Text style={styles.infoText}>{ws!.address}</Text>
              </View>
            </>
          )}

          {isMechanic && (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Award size={16} color={Colors.GreyText} strokeWidth={1.8} />
                </View>
                <Text style={styles.infoText}>{mc!.specialization}</Text>
              </View>
              <View style={styles.infoSep} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Phone size={16} color={Colors.GreyText} strokeWidth={1.8} />
                </View>
                <Text style={styles.infoText}>{mc!.phone}</Text>
              </View>
              <View style={styles.infoSep} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Navigation2
                    size={16}
                    color={Colors.GreyText}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={styles.infoText}>
                  {mc!.experience} · {mc!.jobs} completed jobs
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Services / Skills ── */}
        <Text style={styles.sectionTitle}>
          {isWorkshop ? 'Services Offered' : 'Skills & Specializations'}
        </Text>
        <View style={styles.chipsWrap}>
          {(isWorkshop ? ws!.services : mc!.skills).map(s => (
            <Chip key={s} label={s} />
          ))}
        </View>

        {/* ── Availability Status Banner ── */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isAvailable
                ? 'rgba(16,185,129,0.06)'
                : 'rgba(234,67,53,0.06)',
              borderColor: isAvailable
                ? 'rgba(16,185,129,0.2)'
                : 'rgba(234,67,53,0.2)',
            },
          ]}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isAvailable ? '#10B981' : '#EA4335'},
            ]}
          />
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.statusBannerTitle,
                {color: isAvailable ? '#10B981' : '#EA4335'},
              ]}>
              {isWorkshop
                ? ws!.open
                  ? 'Open Now'
                  : 'Currently Closed'
                : mc!.status === 'Available'
                ? 'Available for Jobs'
                : 'Currently Busy'}
            </Text>
            <Text style={styles.statusBannerSub}>
              {isWorkshop
                ? ws!.hours
                : mc!.status === 'Available'
                ? 'This mechanic can accept your request now'
                : 'Check back later or choose another mechanic'}
            </Text>
          </View>
        </View>

        <View style={{height: 110}} />
      </ScrollView>

      {/* ── Bottom Action Buttons ── */}
      <View style={styles.bottomContainer}>
        {/* Call button */}
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCall}
          activeOpacity={0.8}>
          <Phone size={20} color={Colors.White} strokeWidth={2} />
        </TouchableOpacity>

        {/* Message button */}
        <TouchableOpacity style={styles.msgBtn} activeOpacity={0.8}>
          <MessageCircle size={20} color="#E8490F" strokeWidth={2} />
        </TouchableOpacity>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            !isAvailable && styles.primaryBtnDisabled,
          ]}
          onPress={handleBookOrRequest}
          disabled={!isAvailable}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>
            {isWorkshop ? 'Book Appointment' : 'Request Mechanic'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MechanicWorkshopDetail;

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  errorText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    textAlign: 'center',
    marginTop: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  availBadgeText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 11,
  },

  /* Scroll */
  scroll: {flex: 1},
  scrollContent: {paddingTop: 0, paddingBottom: 16},

  /* Map */
  mapContainer: {
    height: 180,
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  markerWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(232,73,15,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3,0,5,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mapOverlayText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.White,
    flex: 1,
  },

  /* Identity card */
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 22,
    color: '#E8490F',
  },
  identityText: {flex: 1, gap: 4},
  identityName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 20,
    color: Colors.White,
  },
  identitySubtext: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingNumber: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
    marginLeft: 4,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    alignItems: 'center',
  },
  statBox: {flex: 1, alignItems: 'center', gap: 4},
  statVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
  },
  statLbl: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  /* Info card */
  infoCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoSep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.White,
    flex: 1,
  },

  /* Chips */
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.18)',
  },
  chipText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: '#E8490F',
  },

  /* Status banner */
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusBannerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    marginBottom: 3,
  },
  statusBannerSub: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
    lineHeight: 17,
  },

  /* Bottom buttons */
  bottomContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
    backgroundColor: Colors.bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  msgBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(232,73,15,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,73,15,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#E8490F',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(232,73,15,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    letterSpacing: 0.3,
  },
});

const mapDarkStyle = [
  {elementType: 'geometry', stylers: [{color: '#1a1a2e'}]},
  {elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#6b7280'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#1a1a2e'}]},
  {featureType: 'road', elementType: 'geometry.fill', stylers: [{color: '#252540'}]},
  {featureType: 'road.arterial', elementType: 'geometry', stylers: [{color: '#2e2e4e'}]},
  {featureType: 'water', elementType: 'geometry', stylers: [{color: '#0d0d1a'}]},
  {featureType: 'poi', stylers: [{visibility: 'off'}]},
];
