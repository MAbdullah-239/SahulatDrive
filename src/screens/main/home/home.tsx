import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors } from '../../../generalStyles/colors';
import { FontFamily } from '../../../generalStyles/generalFonts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStack as MainStackConstants } from '../../../constants/stack/mainStack/mainStack';
import { MainStackParamList } from '../../../navigation/mainStackNavigation';

import MapView, { Marker } from 'react-native-maps';

interface HomeProps {
  // Navigation props can be added here
}

const Home: React.FC<HomeProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Background Map Area ── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        initialRegion={{
          latitude: 31.5204,
          longitude: 74.3587,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapDarkStyle} // for Android
      >
        {/* User Location Mock Marker */}
        <Marker coordinate={{ latitude: 31.5204, longitude: 74.3587 }}>
          <View style={styles.mockUserDot} />
        </Marker>

        {/* Mock Mechanic Marker */}
        <Marker coordinate={{ latitude: 31.5154, longitude: 74.3527 }}>
          <Text style={{ fontSize: 24 }}>🔧</Text>
        </Marker>
      </MapView>

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">

        {/* ── Top Section (Header & Location) ── */}
        <View style={styles.topContainer} pointerEvents="box-none">
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Good morning 👋</Text>
              <Text style={styles.userName}>Ahmed Raza</Text>
            </View>
            <View>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>👱‍♂️</Text>
                <View style={styles.onlineDot} />
              </View>
            </View>
          </View>

          {/* Location Banner */}
          <View style={styles.locationBanner}>
            <View style={styles.locationLeft}>
              <Text style={styles.pinIcon}>📍</Text>
              <Text style={styles.locationText}>Gulberg III, Lahore</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Spacer ── */}
        <View style={styles.spacer} pointerEvents="none" />

        {/* ── Bottom Dashboard ── */}
        <View style={styles.bottomDashboard} pointerEvents="box-none">

          {/* Action Cards */}
          <View style={styles.actionCardsRow}>
            {/* Emergency Card */}
            <TouchableOpacity 
              style={styles.emergencyCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate(MainStackConstants.nestedScreens.RequestHelp.name)}
            >
              <View style={styles.emergencyIconWrapper}>
                <Text style={styles.emergencyIcon}>🆘</Text>
              </View>
              <Text style={styles.emergencyTitle}>Emergency</Text>
              <Text style={styles.emergencySubtitle}>Request Help Now</Text>
            </TouchableOpacity>

            {/* Right Column Cards */}
            <View style={styles.rightCardsColumn}>
              {/* Workshop Card */}
              <TouchableOpacity 
                style={styles.smallCard} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate(MainStackConstants.nestedScreens.BookWorkshop.name)}
              >
                <Text style={styles.cardEmoji}>🏭</Text>
                <View>
                  <Text style={styles.cardTitle}>Workshops</Text>
                  <Text style={styles.cardSubtitle}>Book Service</Text>
                </View>
              </TouchableOpacity>

              {/* AI Diagnosis Card */}
              <TouchableOpacity 
                style={styles.smallCard} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate(MainStackConstants.nestedScreens.AiDiagnosis.name)}
              >
                <Text style={styles.cardEmoji}>🤖</Text>
                <View>
                  <Text style={styles.cardTitle}>AI Diagnosis</Text>
                  <Text style={styles.cardSubtitle}>Photo Analysis</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nearby Mechanics Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mechanics</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllLink}>See all →</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom navigation is now handled by BottomTabNavigation */}

        </View>
      </SafeAreaView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111214', // Background behind the map
  },

  /* ── Mock Map Layer ── */
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F1013', // Very dark for contrast
    zIndex: 0,
  },
  // Fake grid lines to simulate map background looking like the design
  gridLineVertical1: { position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  gridLineVertical2: { position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  gridLineHorizontal1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  gridLineHorizontal2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  // Fake map icons
  mockUserDot: {
    position: 'absolute', top: '45%', left: '46%', width: 28, height: 28, borderRadius: 14, backgroundColor: '#3B82F6',
    borderWidth: 5, borderColor: '#1D4ED8', shadowColor: '#3B82F6', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }
  },
  mockWrench1: { position: 'absolute', top: '35%', left: '25%', fontSize: 24, opacity: 0.8 },
  mockWrench2: { position: 'absolute', top: '55%', left: '65%', fontSize: 24, opacity: 0.8 },

  /* ── Safe Area Overlay ── */
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  spacer: {
    flex: 1,
  },

  /* ── Top Header Section ── */
  topContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 16,
    color: Colors.GreyText,
    marginBottom: 4,
  },
  userName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: Colors.White,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981', // Green status
    borderWidth: 2,
    borderColor: '#0F1013',
  },

  /* Location Banner */
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinIcon: {
    fontSize: 18,
  },
  locationText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 15,
    color: Colors.White,
  },
  changeLink: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: '#8A94A6',
  },

  /* ── Bottom Dashboard Section ── */
  bottomDashboard: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },

  /* Action Cards */
  actionCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  /* Emergency Card */
  emergencyCard: {
    flex: 1,
    backgroundColor: '#E8490F',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  emergencyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyIcon: {
    fontSize: 20,
  },
  emergencyTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  /* Right Column Cards */
  rightCardsColumn: {
    flex: 1.1, // slightly wider than emergency card
    gap: 12,
  },
  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },

  /* Nearby Mechanics Section */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 22,
    color: Colors.White,
  },
  seeAllLink: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: '#E8490F',
  },
});

const mapDarkStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];
