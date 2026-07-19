import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Wrench,
  Star,
} from 'lucide-react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  WIDTH_BASE_RATIO,
  HEIGHT_BASE_RATIO,
  FONT_SIZE,
} from '../../../utils/helpers';
interface LiveTrackingScreenProps {
  onClose: () => void;
}
const USER_COORD = {latitude: 31.5204, longitude: 74.3587};
const MECHANIC_COORD = {latitude: 31.529, longitude: 74.363};
const ROUTE_COORDS = [
  {latitude: 31.529, longitude: 74.363},
  {latitude: 31.529, longitude: 74.3587},
  {latitude: 31.5204, longitude: 74.3587},
];
const STATUS_STEPS = ['Accepted', 'En Route', 'Arrived', 'Working', 'Done'];
const mapDarkStyle = [
  {elementType: 'geometry', stylers: [{color: '#1a1a2e'}]},
  {elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#6b7280'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#1a1a2e'}]},
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{color: '#252540'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b7280'}],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{color: '#2e2e4e'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#333355'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#0d0d1a'}],
  },
  {featureType: 'poi', stylers: [{visibility: 'off'}]},
  {featureType: 'transit', stylers: [{visibility: 'off'}]},
];
const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({onClose}) => {
  const [etaMinutes, setEtaMinutes] = useState(7);
  const [activeStep, setActiveStep] = useState(1);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);
  useEffect(() => {
    if (etaMinutes <= 0) return;
    const id = setInterval(() => setEtaMinutes(p => Math.max(0, p - 1)), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        customMapStyle={mapDarkStyle}
        initialRegion={{
          latitude: 31.5247,
          longitude: 74.361,
          latitudeDelta: 0.022,
          longitudeDelta: 0.022,
        }}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}>
        <Polyline
          coordinates={ROUTE_COORDS}
          strokeColor="#E8490F"
          strokeWidth={3}
          lineDashPattern={[6, 6]}
        />
        <Marker coordinate={USER_COORD}>
          <View style={styles.userMarker}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>
        <Marker coordinate={MECHANIC_COORD} anchor={{x: 0.5, y: 0.5}}>
          <View style={styles.mechanicMarkerWrap}>
            <Animated.View
              style={[
                styles.pulseRing,
                {transform: [{scale: pulseAnim}], opacity: pulseOpacity},
              ]}
            />
            <View style={styles.mechanicMarkerCircle}>
              <View style={styles.mechanicMarkerIcon}>
                <Wrench
                  size={WIDTH_BASE_RATIO(16)}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
              </View>
            </View>
          </View>
        </Marker>
      </MapView>
      <View style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onClose}
          activeOpacity={0.85}>
          <ArrowLeft
            size={WIDTH_BASE_RATIO(18)}
            color={Colors.White}
            strokeWidth={2.2}
          />
        </TouchableOpacity>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>Live Tracking</Text>
        </View>
      </View>
      <View style={styles.bottomSheet}>
        <View style={styles.etaCard}>
          <View>
            <Text style={styles.etaLabel}>Mechanic arriving in</Text>
            <View style={styles.etaValueRow}>
              <Text style={styles.etaNumber}>{etaMinutes}</Text>
              <Text style={styles.etaUnit}> min</Text>
            </View>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.distanceBox}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>1.4 km</Text>
          </View>
        </View>
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {STATUS_STEPS[activeStep]}
              </Text>
            </View>
          </View>
          <View style={styles.stepTrack}>
            <View style={styles.stepTrackLine} />
            <View
              style={[
                styles.stepTrackFill,
                {width: `${(activeStep / (STATUS_STEPS.length - 1)) * 100}%`},
              ]}
            />
            {STATUS_STEPS.map((label, idx) => {
              const done = idx < activeStep;
              const active = idx === activeStep;
              return (
                <View key={label} style={styles.stepNodeWrap}>
                  <View
                    style={[
                      styles.stepNode,
                      done && styles.stepNodeDone,
                      active && styles.stepNodeActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.stepNodeLabel,
                      (done || active) && styles.stepNodeLabelActive,
                    ]}
                    numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.mechanicRow}>
          <View style={styles.mechanicAvatar}>
            <Text style={styles.mechanicAvatarText}>👷</Text>
            <View style={styles.mechanicOnlineDot} />
          </View>
          <View style={styles.mechanicInfo}>
            <Text style={styles.mechanicName}>Tariq Mahmood</Text>
            <Text style={styles.mechanicSub}>
              Certified Mechanic · 847 jobs
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4].map(i => (
                <Star
                  key={i}
                  size={WIDTH_BASE_RATIO(13)}
                  color="#F59E0B"
                  fill="#F59E0B"
                  strokeWidth={1}
                />
              ))}
              <Star
                size={WIDTH_BASE_RATIO(13)}
                color="#F59E0B"
                fill="transparent"
                strokeWidth={1.5}
              />
              <Text style={styles.ratingVal}>4.8</Text>
            </View>
          </View>
          <View style={styles.mechanicActions}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Phone
                size={WIDTH_BASE_RATIO(18)}
                color={Colors.White}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <MessageCircle
                size={WIDTH_BASE_RATIO(18)}
                color={Colors.White}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LiveTrackingScreen;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  topOverlay: {
    position: 'absolute',
    top:
      Platform.OS === 'android' ? HEIGHT_BASE_RATIO(44) : HEIGHT_BASE_RATIO(56),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: WIDTH_BASE_RATIO(20),
  },
  backBtn: {
    width: WIDTH_BASE_RATIO(44),
    height: WIDTH_BASE_RATIO(44),
    borderRadius: WIDTH_BASE_RATIO(14),
    backgroundColor: 'rgba(15,15,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(6),
    backgroundColor: 'rgba(15,15,20,0.85)',
    borderRadius: WIDTH_BASE_RATIO(20),
    paddingHorizontal: WIDTH_BASE_RATIO(14),
    paddingVertical: HEIGHT_BASE_RATIO(8),
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  liveDot: {
    width: WIDTH_BASE_RATIO(8),
    height: WIDTH_BASE_RATIO(8),
    borderRadius: WIDTH_BASE_RATIO(4),
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(13),
    color: Colors.White,
    letterSpacing: 0.2,
  },

  userMarker: {
    width: WIDTH_BASE_RATIO(22),
    height: WIDTH_BASE_RATIO(22),
    borderRadius: WIDTH_BASE_RATIO(11),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  userMarkerInner: {
    width: WIDTH_BASE_RATIO(8),
    height: WIDTH_BASE_RATIO(8),
    borderRadius: WIDTH_BASE_RATIO(4),
    backgroundColor: '#FFFFFF',
  },
  mechanicMarkerWrap: {
    width: WIDTH_BASE_RATIO(64),
    height: WIDTH_BASE_RATIO(64),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: WIDTH_BASE_RATIO(54),
    height: WIDTH_BASE_RATIO(54),
    borderRadius: WIDTH_BASE_RATIO(27),
    backgroundColor: 'rgba(232,73,15,0.3)',
  },
  mechanicMarkerCircle: {
    width: WIDTH_BASE_RATIO(46),
    height: WIDTH_BASE_RATIO(46),
    borderRadius: WIDTH_BASE_RATIO(23),
    backgroundColor: 'rgba(232,73,15,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(232,73,15,0.5)',
  },
  mechanicMarkerIcon: {
    width: WIDTH_BASE_RATIO(36),
    height: WIDTH_BASE_RATIO(36),
    borderRadius: WIDTH_BASE_RATIO(18),
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 8,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0D14',
    borderTopLeftRadius: WIDTH_BASE_RATIO(28),
    borderTopRightRadius: WIDTH_BASE_RATIO(28),
    paddingTop: HEIGHT_BASE_RATIO(20),
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    paddingBottom:
      Platform.OS === 'ios' ? HEIGHT_BASE_RATIO(40) : HEIGHT_BASE_RATIO(24),
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderRadius: WIDTH_BASE_RATIO(18),
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.15)',
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    marginBottom: HEIGHT_BASE_RATIO(20),
  },
  etaLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(13),
    color: Colors.GreyText,
    marginBottom: HEIGHT_BASE_RATIO(2),
  },
  etaValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  etaNumber: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(38),
    color: '#E8490F',
    lineHeight: HEIGHT_BASE_RATIO(42),
  },
  etaUnit: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(18),
    color: Colors.GreyText,
    marginBottom: HEIGHT_BASE_RATIO(4),
    marginLeft: WIDTH_BASE_RATIO(2),
  },
  etaDivider: {
    flex: 1,
  },
  distanceBox: {
    alignItems: 'flex-end',
  },
  distanceLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(12),
    color: Colors.GreyText,
    marginBottom: HEIGHT_BASE_RATIO(2),
  },
  distanceValue: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(22),
    color: Colors.White,
  },
  statusSection: {
    marginBottom: HEIGHT_BASE_RATIO(20),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(14),
  },
  statusTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(16),
    color: Colors.White,
  },
  statusBadge: {
    backgroundColor: 'rgba(232,73,15,0.15)',
    borderRadius: WIDTH_BASE_RATIO(8),
    paddingHorizontal: WIDTH_BASE_RATIO(12),
    paddingVertical: HEIGHT_BASE_RATIO(5),
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.3)',
  },
  statusBadgeText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(12),
    color: '#E8490F',
  },
  stepTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  stepTrackLine: {
    position: 'absolute',
    top: HEIGHT_BASE_RATIO(6),
    left: WIDTH_BASE_RATIO(10),
    right: WIDTH_BASE_RATIO(10),
    height: HEIGHT_BASE_RATIO(3),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  stepTrackFill: {
    position: 'absolute',
    top: HEIGHT_BASE_RATIO(6),
    left: WIDTH_BASE_RATIO(10),
    height: HEIGHT_BASE_RATIO(3),
    backgroundColor: '#E8490F',
    borderRadius: 2,
  },
  stepNodeWrap: {
    alignItems: 'center',
    flex: 1,
  },
  stepNode: {
    width: WIDTH_BASE_RATIO(14),
    height: WIDTH_BASE_RATIO(14),
    borderRadius: WIDTH_BASE_RATIO(7),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: HEIGHT_BASE_RATIO(6),
  },
  stepNodeDone: {
    backgroundColor: '#E8490F',
    borderColor: '#E8490F',
  },
  stepNodeActive: {
    backgroundColor: '#030005',
    borderColor: '#E8490F',
    borderWidth: 2.5,
  },
  stepNodeLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: FONT_SIZE(10),
    color: Colors.GreyText,
    textAlign: 'center',
  },
  stepNodeLabelActive: {
    fontFamily: FontFamily.UrbanistBold,
    color: Colors.White,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: WIDTH_BASE_RATIO(18),
    padding: WIDTH_BASE_RATIO(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: WIDTH_BASE_RATIO(12),
  },
  mechanicAvatar: {
    width: WIDTH_BASE_RATIO(52),
    height: WIDTH_BASE_RATIO(52),
    borderRadius: WIDTH_BASE_RATIO(16),
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicAvatarText: {
    fontSize: WIDTH_BASE_RATIO(28),
  },
  mechanicOnlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: WIDTH_BASE_RATIO(12),
    height: WIDTH_BASE_RATIO(12),
    borderRadius: WIDTH_BASE_RATIO(6),
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0D0D14',
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(16),
    color: Colors.White,
    marginBottom: HEIGHT_BASE_RATIO(2),
  },
  mechanicSub: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: FONT_SIZE(12),
    color: Colors.GreyText,
    marginBottom: HEIGHT_BASE_RATIO(5),
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(2),
  },
  ratingVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(13),
    color: Colors.White,
    marginLeft: WIDTH_BASE_RATIO(4),
  },
  mechanicActions: {
    flexDirection: 'row',
    gap: WIDTH_BASE_RATIO(8),
  },
  actionBtn: {
    width: WIDTH_BASE_RATIO(42),
    height: WIDTH_BASE_RATIO(42),
    borderRadius: WIDTH_BASE_RATIO(13),
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
