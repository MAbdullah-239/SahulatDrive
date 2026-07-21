import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  InteractionManager,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  requestCurrentLocation,
  reverseGeocode,
  Coordinates,
} from '../../../utils/location';
import {useAppSelector} from '../../../redux/hooks';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStack as MainStackConstants} from '../../../constants/stack/mainStack/mainStack';
import {MainStackParamList} from '../../../navigation/mainStackNavigation';
import {
  AlertTriangle,
  Wrench,
  Bot,
  Mic,
  ChevronRight,
  Bell,
  LocateFixed,
} from 'lucide-react-native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {BottomTabParamList} from '../../../navigation/bottomTabNavigation';
import {CompositeNavigationProp} from '@react-navigation/native';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {mapDarkStyle} from '../../../generalStyles/mapDarkStyle';

type HomeNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList>,
  BottomTabNavigationProp<BottomTabParamList>
>;

const DEFAULT_COORDS: Coordinates = {latitude: 31.5204, longitude: 74.3587};

const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const userName = useAppSelector(state => state.auth.user?.name);
  const userInitials =
    userName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || '?';
  const mapRef = useRef<MapView>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [recentering, setRecentering] = useState(false);

  const goToCurrentLocation = useCallback(async (fresh: Coordinates) => {
    mapRef.current?.animateToRegion(
      {
        latitude: fresh.latitude,
        longitude: fresh.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('[home] fetching location for the banner…');
      const task = InteractionManager.runAfterInteractions(async () => {
        // forceRefresh: this screen is the first thing the user sees each
        // time — reusing a stale cached fix here is exactly what made the
        // location look "static" instead of tracking real movement.
        const location = await requestCurrentLocation(true);
        console.log('[home] location result:', location);
        setCoords(location);
        setLocationLoading(false);
        if (location) {
          setPlaceName(await reverseGeocode(location));
        }
      });
      return () => task.cancel();
    }, []),
  );

  const handleRecenter = async () => {
    setRecentering(true);
    const location = await requestCurrentLocation(true);
    setRecentering(false);
    if (!location) {
      return;
    }
    setCoords(location);
    goToCurrentLocation(location);
    setPlaceName(await reverseGeocode(location));
  };

  const mapCenter = coords ?? DEFAULT_COORDS;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Background Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        initialRegion={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapDarkStyle}>
        <Marker coordinate={mapCenter}>
          <View style={styles.userDot} />
        </Marker>
        <Marker coordinate={{latitude: 31.5154, longitude: 74.3527}}>
          <View style={styles.mechanicMarker}>
            <Wrench size={13} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </Marker>
        <Marker coordinate={{latitude: 31.528, longitude: 74.365}}>
          <View style={[styles.mechanicMarker, {backgroundColor: '#10B981'}]}>
            <Wrench size={13} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </Marker>
      </MapView>

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        {/* ── Header ── */}
        <View style={styles.topContainer} pointerEvents="box-none">
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Good morning 👋</Text>
              <Text style={styles.userName}>{userName ?? 'there'}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Bell size={20} color={Colors.White} strokeWidth={1.8} />
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarInitials}>{userInitials}</Text>
                <View style={styles.onlineDot} />
              </View>
            </View>
          </View>

          {/* Location Banner — tap to recenter the map on your current position */}
          <TouchableOpacity
            style={styles.locationBanner}
            activeOpacity={0.8}
            onPress={handleRecenter}
            disabled={recentering}>
            <View style={styles.locationLeft}>
              <View style={styles.locationIconWrap}>
                <LocateFixed size={16} color="#E8490F" strokeWidth={2} />
              </View>
              <View style={styles.locationTextWrap}>
                <Text style={styles.locationLabel}>Current Location</Text>
                <Text style={styles.locationText}>
                  {recentering
                    ? 'Locating…'
                    : locationLoading
                    ? 'Detecting…'
                    : placeName
                    ? placeName
                    : coords
                    ? `${coords.latitude.toFixed(
                        4,
                      )}° N, ${coords.longitude.toFixed(4)}° E`
                    : 'Location unavailable'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.GreyText} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        {/* ── Bottom Dashboard ── */}
        <View style={styles.bottomDashboard} pointerEvents="box-none">
          {/* Action Cards */}
          <View style={styles.actionCardsRow}>
            {/* Emergency Card */}
            <TouchableOpacity
              style={styles.emergencyCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(
                  MainStackConstants.nestedScreens.RequestHelp.name,
                )
              }>
              <View style={styles.emergencyIconWrapper}>
                <AlertTriangle size={26} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.emergencyTitle}>Emergency</Text>
              <Text style={styles.emergencySubtitle}>Request Help Now</Text>
            </TouchableOpacity>

            {/* Right Column */}
            <View style={styles.rightCardsColumn}>
              <TouchableOpacity
                style={styles.smallCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate(
                    MainStackConstants.nestedScreens.BookWorkshop.name,
                  )
                }>
                <View style={styles.smallCardIcon}>
                  <Wrench size={20} color="#E8490F" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Workshops</Text>
                  <Text style={styles.cardSubtitle}>Book Service</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate(
                    MainStackConstants.nestedScreens.AiDiagnosis.name,
                  )
                }>
                <View style={styles.smallCardIcon}>
                  <Bot size={20} color="#3B82F6" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>AI Diagnosis</Text>
                  <Text style={styles.cardSubtitle}>Photo Analysis</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.voiceAssistantCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                MainStackConstants.nestedScreens.VoiceAssistant.name,
              )
            }>
            <View style={styles.smallCardIcon}>
              <Mic size={20} color="#34C85A" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Voice Assistant</Text>
              <Text style={styles.cardSubtitle}>
                Ask about vehicle issues, in English or Urdu
              </Text>
            </View>
          </TouchableOpacity>

          {/* Nearby Mechanics Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mechanics</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAllLink}>See all</Text>
              <ChevronRight size={14} color="#E8490F" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111214',
  },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
  },
  mechanicMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  spacer: {flex: 1},
  topContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.GreyText,
    marginBottom: 3,
  },
  userName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 24,
    color: Colors.White,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8490F',
    borderWidth: 1.5,
    borderColor: '#030005',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F1013',
  },
  locationBanner: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  locationTextWrap: {
    flex: 1,
    width: 340,
  },

  locationText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: Colors.White,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,73,15,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },
  locationLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
    marginBottom: 2,
  },

  bottomDashboard: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  emergencyCard: {
    flex: 1,
    backgroundColor: '#E8490F',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  emergencyIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emergencyTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  rightCardsColumn: {
    flex: 1.05,
    gap: 12,
  },
  voiceAssistantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  smallCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 20,
    color: Colors.White,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllLink: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#E8490F',
  },
});
