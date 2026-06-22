import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../../../generalStyles/colors';
import { FontFamily } from '../../../generalStyles/generalFonts';

const { width } = Dimensions.get('window');

interface ExploreProps {
  onSelectCategory?: (category: string) => void;
}

const categories = [
  { id: 'battery', name: 'Battery', emoji: '🔋' },
  { id: 'tyre', name: 'Tyre', emoji: '⚙️' },
  { id: 'engine', name: 'Engine', emoji: '🔧' },
  { id: 'tow', name: 'Tow Truck', emoji: '🛻' },
  { id: 'fuel', name: 'Fuel Delivery', emoji: '⛽' },
  { id: 'wash', name: 'Car Wash', emoji: '🧼' },
];

const mockWorkshops = [
  {
    id: 'w1',
    name: 'Auto Experts Workshop',
    rating: 4.8,
    reviews: 124,
    distance: '1.2 km',
    open: true,
    coordinate: { latitude: 31.5244, longitude: 74.3547 },
  },
  {
    id: 'w2',
    name: 'QuickFix Car Service',
    rating: 4.6,
    reviews: 89,
    distance: '2.5 km',
    open: true,
    coordinate: { latitude: 31.5124, longitude: 74.3647 },
  },
  {
    id: 'w3',
    name: 'Lahore Tuning Center',
    rating: 4.2,
    reviews: 45,
    distance: '3.8 km',
    open: false,
    coordinate: { latitude: 31.5304, longitude: 74.3487 },
  },
];

const mockMechanics = [
  {
    id: 'm1',
    name: 'Zahid Khan',
    rating: 4.9,
    specialization: 'Engine & Electrical',
    status: 'Available',
    emoji: '👨‍🔧',
    coordinate: { latitude: 31.5154, longitude: 74.3527 },
  },
  {
    id: 'm2',
    name: 'Muhammad Ali',
    rating: 4.7,
    specialization: 'Tyre & Suspension',
    status: 'Busy',
    emoji: '🔧',
    coordinate: { latitude: 31.5224, longitude: 74.3597 },
  },
  {
    id: 'm3',
    name: 'Sajid Mehmood',
    rating: 4.5,
    specialization: 'Brake Specialist',
    status: 'Available',
    emoji: '⚙️',
    coordinate: { latitude: 31.5184, longitude: 74.3417 },
  },
];

const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

export const Explore: React.FC<ExploreProps> = ({ onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(f => f !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  const filteredWorkshops = mockWorkshops.filter(workshop => {
    // Basic search filtering
    const matchesSearch = workshop.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check custom filters
    const matchesDistance = activeFilters.includes('distance') 
      ? parseFloat(workshop.distance) < 2.0 
      : true;
    
    const matchesRating = activeFilters.includes('rating') 
      ? workshop.rating >= 4.5 
      : true;

    const matchesAvailability = activeFilters.includes('availability')
      ? workshop.open
      : true;

    return matchesSearch && matchesDistance && matchesRating && matchesAvailability;
  });

  const filteredMechanics = mockMechanics.filter(mechanic => {
    const matchesSearch = mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mechanic.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = activeFilters.includes('rating') 
      ? mechanic.rating >= 4.7 
      : true;

    const matchesAvailability = activeFilters.includes('availability')
      ? mechanic.status === 'Available'
      : true;

    return matchesSearch && matchesRating && matchesAvailability;
  });

  return (
    <View style={styles.container}>
      {/* ── Search & Filters Overlay Header ── */}
      <View style={styles.topHeader}>
        <View style={styles.searchBarContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanics, workshops, services..."
            placeholderTextColor={Colors.Grey || '#868686'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#E8490F"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Badges */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilters.includes('distance') && styles.filterChipActive,
            ]}
            onPress={() => toggleFilter('distance')}
            activeOpacity={0.7}
          >
            <Text style={styles.filterChipEmoji}>📍</Text>
            <Text
              style={[
                styles.filterChipText,
                activeFilters.includes('distance') && styles.filterChipTextActive,
              ]}
            >
              Distance &lt; 2km
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilters.includes('rating') && styles.filterChipActive,
            ]}
            onPress={() => toggleFilter('rating')}
            activeOpacity={0.7}
          >
            <Text style={styles.filterChipEmoji}>⭐</Text>
            <Text
              style={[
                styles.filterChipText,
                activeFilters.includes('rating') && styles.filterChipTextActive,
              ]}
            >
              Top Rated (4.5+)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilters.includes('availability') && styles.filterChipActive,
            ]}
            onPress={() => toggleFilter('availability')}
            activeOpacity={0.7}
          >
            <Text style={styles.filterChipEmoji}>🟢</Text>
            <Text
              style={[
                styles.filterChipText,
                activeFilters.includes('availability') && styles.filterChipTextActive,
              ]}
            >
              Available Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Map Preview Section ── */}
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            userInterfaceStyle="dark"
            initialRegion={{
              latitude: 31.5204,
              longitude: 74.3587,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
            customMapStyle={mapDarkStyle}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {/* User Location */}
            <Marker coordinate={{ latitude: 31.5204, longitude: 74.3587 }}>
              <View style={styles.userDot} />
            </Marker>

            {/* Mechanics & Workshops on Map */}
            {filteredWorkshops.map(w => (
              <Marker key={w.id} coordinate={w.coordinate}>
                <View style={styles.mapMarkerBadge}>
                  <Text style={styles.mapMarkerEmoji}>🏭</Text>
                </View>
              </Marker>
            ))}
            {filteredMechanics.map(m => (
              <Marker key={m.id} coordinate={m.coordinate}>
                <View style={[styles.mapMarkerBadge, { backgroundColor: '#E8490F' }]}>
                  <Text style={styles.mapMarkerEmoji}>🔧</Text>
                </View>
              </Marker>
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapLabel}>Map Preview · Nearby Helpers</Text>
            <Text style={styles.mapSubLabel}>Interactive live assistance map</Text>
          </View>
        </View>

        {/* ── Categories Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => onSelectCategory?.(category.name)}
            >
              <View style={styles.categoryEmojiWrapper}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Nearby Workshops Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Workshops</Text>
          <Text style={styles.sectionCount}>({filteredWorkshops.length})</Text>
        </View>

        {filteredWorkshops.length === 0 ? (
          <View style={styles.noResultsCard}>
            <Text style={styles.noResultsText}>No workshops match your search filters.</Text>
          </View>
        ) : (
          filteredWorkshops.map(workshop => (
            <TouchableOpacity key={workshop.id} style={styles.workshopCard} activeOpacity={0.85}>
              <View style={styles.cardMainInfo}>
                <View style={styles.workshopEmojiWrapper}>
                  <Text style={styles.workshopEmoji}>🏭</Text>
                </View>
                <View style={styles.workshopTextWrapper}>
                  <Text style={styles.workshopName}>{workshop.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{workshop.rating}</Text>
                    <Text style={styles.reviewsText}>({workshop.reviews} reviews)</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>📍 {workshop.distance}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: workshop.open ? '#10B981' : '#EA4335' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: workshop.open ? '#10B981' : '#EA4335' },
                        ]}
                      >
                        {workshop.open ? 'Open Now' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* ── Top Rated Mechanics ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Mechanics</Text>
          <Text style={styles.sectionCount}>({filteredMechanics.length})</Text>
        </View>

        {filteredMechanics.length === 0 ? (
          <View style={styles.noResultsCard}>
            <Text style={styles.noResultsText}>No mechanics match your search filters.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mechanicScroll}
            contentContainerStyle={styles.mechanicScrollContent}
          >
            {filteredMechanics.map(mechanic => (
              <TouchableOpacity key={mechanic.id} style={styles.mechanicCard} activeOpacity={0.85}>
                <View style={styles.mechanicHeader}>
                  <View style={styles.mechanicAvatar}>
                    <Text style={styles.mechanicEmoji}>{mechanic.emoji}</Text>
                  </View>
                  <View
                    style={[
                      styles.mechanicStatusBadge,
                      {
                        backgroundColor:
                          mechanic.status === 'Available'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(232, 73, 15, 0.12)',
                        borderColor:
                          mechanic.status === 'Available'
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(232, 73, 15, 0.3)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.mechanicStatusText,
                        { color: mechanic.status === 'Available' ? '#10B981' : '#E8490F' },
                      ]}
                    >
                      {mechanic.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.mechanicName} numberOfLines={1}>
                  {mechanic.name}
                </Text>
                <Text style={styles.mechanicSpecialty} numberOfLines={1}>
                  {mechanic.specialization}
                </Text>

                <View style={styles.mechanicRatingRow}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.mechanicRatingVal}>{mechanic.rating}</Text>
                  <Text style={styles.mechanicRatingLabel}>Rating</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#030005',
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.bgColor || '#030005',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
    paddingVertical: 0,
  },
  clearIcon: {
    color: Colors.GreyText || '#A7A7A7',
    fontSize: 14,
    marginLeft: 8,
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(232, 73, 15, 0.12)',
    borderColor: '#E8490F',
  },
  filterChipEmoji: {
    fontSize: 12,
    marginRight: 6,
  },
  filterChipText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  filterChipTextActive: {
    color: '#E8490F',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  /* Map Preview */
  mapContainer: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  mapMarkerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mapMarkerEmoji: {
    fontSize: 14,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3, 0, 5, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mapLabel: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
  },
  mapSubLabel: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 11,
    color: Colors.GreyText || '#A7A7A7',
    marginTop: 2,
  },
  /* Categories */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 20,
    color: Colors.White || '#FFFFFF',
  },
  sectionCount: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
    marginLeft: 8,
  },
  categoryScroll: {
    marginBottom: 24,
    marginHorizontal: -24,
  },
  categoryContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    width: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmojiWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
  },
  /* Nearby Workshops */
  noResultsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  noResultsText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
  },
  workshopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    marginBottom: 14,
  },
  cardMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workshopEmojiWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workshopEmoji: {
    fontSize: 24,
  },
  workshopTextWrapper: {
    flex: 1,
  },
  workshopName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: Colors.White || '#FFFFFF',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  ratingText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
    marginRight: 4,
  },
  reviewsText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
  },
  metaDot: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 12,
  },
  /* Top Rated Mechanics */
  mechanicScroll: {
    marginBottom: 24,
    marginHorizontal: -24,
  },
  mechanicScrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  mechanicCard: {
    width: width * 0.44,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
  },
  mechanicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  mechanicAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicEmoji: {
    fontSize: 22,
  },
  mechanicStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  mechanicStatusText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  mechanicName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
    marginBottom: 2,
  },
  mechanicSpecialty: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 12,
  },
  mechanicRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  mechanicRatingVal: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
    marginLeft: 3,
    marginRight: 6,
  },
  mechanicRatingLabel: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 11,
    color: Colors.Grey || '#868686',
  },
  bottomSpacer: {
    height: 100,
  },
});
