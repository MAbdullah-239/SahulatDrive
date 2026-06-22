import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';

interface Workshop {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  closingTime: string;
  emoji: string;
  emojiBg: string;
}

const mockWorkshops: Workshop[] = [
  {
    id: 'autofix',
    name: 'AutoFix Pro',
    location: 'Liberty Market, Lahore',
    distance: '0.8 km',
    rating: 4.9,
    reviewsCount: 312,
    tags: ['Tyres', 'Engine', 'AC'],
    closingTime: '9 PM',
    emoji: '🏭',
    emojiBg: '#E8490F',
  },
  {
    id: 'citycar',
    name: 'City Car Care',
    location: 'Gulberg II, Lahore',
    distance: '1.3 km',
    rating: 4.4,
    reviewsCount: 189,
    tags: ['Oil Change', 'Brakes'],
    closingTime: '8 PM',
    emoji: '🚗',
    emojiBg: '#3B82F6',
  },
];

const dates = [
  {day: 'Mon', num: '7'},
  {day: 'Tue', num: '8'},
  {day: 'Wed', num: '9'},
  {day: 'Thu', num: '10'},
];

const timeSlots = ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
const categories = ['All', 'Oil Change', 'Tyres', 'AC Repair', 'Brakes', 'Detailing'];

const BookWorkshop = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(mockWorkshops[0]); // default to Autofix like in mockup
  const [selectedDate, setSelectedDate] = useState('7');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Workshop</Text>
        <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
          <Text style={styles.mapIcon}>🗺️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search Bar ── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search workshops, services..."
            placeholderTextColor={Colors.Grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#E8490F"
          />
        </View>

        {/* ── Horizontal Filter Categories ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTag,
                  isSelected ? styles.categoryTagActive : styles.categoryTagInactive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.categoryText,
                  isSelected ? styles.categoryTextActive : styles.categoryTextInactive,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Subtitle ── */}
        <Text style={styles.subtitle}>8 workshops near Gulberg III</Text>

        {/* ── Workshop List ── */}
        <View style={styles.workshopList}>
          {mockWorkshops.map(shop => (
            <View key={shop.id} style={styles.workshopCard}>
              {/* Row containing avatar & shop details */}
              <View style={styles.shopRow}>
                <View
                  style={[
                    styles.shopAvatarWrapper,
                    {backgroundColor: shop.emojiBg},
                  ]}
                >
                  <Text style={styles.shopAvatarEmoji}>{shop.emoji}</Text>
                </View>
                
                <View style={styles.shopDetails}>
                  <View style={styles.shopHeaderRow}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{shop.distance}</Text>
                    </View>
                  </View>

                  <Text style={styles.shopLocation}>{shop.location}</Text>

                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>
                      {shop.rating} <Text style={styles.reviewsText}>· {shop.reviewsCount} reviews</Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tags Row */}
              {shop.tags && shop.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {shop.tags.map(tag => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagText}>
                        {tag === 'Tyres' ? '⚙️ ' : tag === 'Engine' ? '🔧 ' : tag === 'AC' ? '❄️ ' : ''}
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Footer row with status & Book Now button */}
              <View style={styles.cardFooter}>
                <Text style={styles.statusText}>
                  Open <Text style={styles.closingText}>· Closes {shop.closingTime}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.bookNowBtn}
                  activeOpacity={0.8}
                  onPress={() => setBookingWorkshop(shop)}
                >
                  <Text style={styles.bookNowBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── Select Date & Time (Bottom Interactive Panel) ── */}
        {bookingWorkshop && (
          <View style={styles.bookingPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelIcon}>📅</Text>
              <Text style={styles.panelTitle}>Select Date & Time – {bookingWorkshop.name}</Text>
            </View>

            {/* Horizontal Date Pickers */}
            <View style={styles.datePickerRow}>
              {dates.map(d => {
                const isSelected = selectedDate === d.num;
                return (
                  <TouchableOpacity
                    key={d.num}
                    style={[
                      styles.dateCard,
                      isSelected ? styles.dateCardActive : styles.dateCardInactive,
                    ]}
                    onPress={() => setSelectedDate(d.num)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.dateDayText,
                      isSelected ? styles.dateTextActive : styles.dateTextInactive,
                    ]}>
                      {d.day}
                    </Text>
                    <Text style={[
                      styles.dateNumText,
                      isSelected ? styles.dateTextActive : styles.dateTextInactive,
                    ]}>
                      {d.num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Grid of Time Slots */}
            <View style={styles.timeSlotsRow}>
              {timeSlots.map(t => {
                const isSelected = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.timeSlotBadge,
                      isSelected ? styles.timeSlotActive : styles.timeSlotInactive,
                    ]}
                    onPress={() => setSelectedTime(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      isSelected ? styles.timeSlotTextActive : styles.timeSlotTextInactive,
                    ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm Button inside Booking Panel */}
            <TouchableOpacity
              style={styles.confirmBookingBtn}
              activeOpacity={0.85}
              onPress={() => {
                // Confirm action logic
                navigation.goBack();
              }}
            >
              <Text style={styles.confirmBookingBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookWorkshop;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#030005',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.White || '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 22,
    color: Colors.White || '#FFFFFF',
    fontWeight: 'bold',
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  /* ── Search Bar ── */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  searchInput: {
    flex: 1,
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 15,
    height: '100%',
  },
  /* ── Filter Categories ── */
  categoriesContainer: {
    marginBottom: 20,
    marginHorizontal: -24,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTagInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryTagActive: {
    backgroundColor: '#E8490F',
  },
  categoryText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextInactive: {
    color: Colors.GreyText || '#A7A7A7',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  /* ── Subtitle ── */
  subtitle: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 16,
  },
  /* ── Workshops List ── */
  workshopList: {
    gap: 16,
    marginBottom: 24,
  },
  workshopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 18,
  },
  shopRow: {
    flexDirection: 'row',
  },
  shopAvatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shopAvatarEmoji: {
    fontSize: 24,
  },
  shopDetails: {
    flex: 1,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 17,
    color: Colors.White || '#FFFFFF',
    fontWeight: '700',
  },
  distanceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  shopLocation: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
    fontWeight: '600',
  },
  reviewsText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    color: Colors.Grey || '#868686',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 12,
    color: Colors.White || '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  statusText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
  closingText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    color: Colors.GreyText || '#A7A7A7',
    fontWeight: '400',
  },
  bookNowBtn: {
    backgroundColor: '#E8490F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookNowBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  /* ── Booking Panel ── */
  bookingPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: '#E8490F',
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  panelTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
    fontWeight: '700',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  dateCard: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCardInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateCardActive: {
    backgroundColor: '#E8490F',
  },
  dateDayText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 11,
  },
  dateNumText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateTextInactive: {
    color: Colors.GreyText || '#A7A7A7',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  timeSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeSlotBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  timeSlotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeSlotActive: {
    backgroundColor: '#E8490F',
  },
  timeSlotText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    fontWeight: '600',
  },
  timeSlotTextInactive: {
    color: Colors.GreyText || '#A7A7A7',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
  },
  confirmBookingBtn: {
    backgroundColor: '#E8490F',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBookingBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
