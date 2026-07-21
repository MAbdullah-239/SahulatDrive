import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {
  requestCurrentLocation,
  reverseGeocode,
  Coordinates,
} from '../../../utils/location';
import {
  ApiWorkshop,
  getWorkshops,
  getWorkshopBookings,
  createWorkshopBooking,
} from '../../../requestHandler/api';

const timeSlots = ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];

const TIME_TO_24H: Record<string, {hours: number; minutes: number}> = {
  '10:00 AM': {hours: 10, minutes: 0},
  '11:00 AM': {hours: 11, minutes: 0},
  '2:00 PM': {hours: 14, minutes: 0},
  '4:00 PM': {hours: 16, minutes: 0},
};

// Next 4 real calendar days, so the picker maps onto an actual scheduled_at
// instead of the hardcoded "Mon 7 / Tue 8" placeholders it used to show.
const buildUpcomingDates = () => {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates: {day: string; num: string; date: Date}[] = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      day: dayLabels[d.getDay()],
      num: String(d.getDate()),
      date: d,
    });
  }
  return dates;
};

interface MyBooking {
  id: string;
  description: string;
  scheduledAt: string | null;
  status: string;
  address: string;
  workshopName: string | null;
}

const normalizeBooking = (raw: any): MyBooking => ({
  id: raw.id,
  description: raw.description ?? '',
  scheduledAt: raw.scheduled_at ?? null,
  status: raw.status ?? 'pending',
  address: raw.customer_address ?? '',
  workshopName:
    raw.provider?.workshop_name ??
    raw.provider?.name ??
    raw.workshop?.name ??
    null,
});

const STATUS_COLORS: Record<string, {color: string; bg: string}> = {
  pending: {color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'},
  accepted: {color: '#10B981', bg: 'rgba(16,185,129,0.1)'},
  rejected: {color: '#EA4335', bg: 'rgba(234,67,53,0.1)'},
  completed: {color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'},
  cancelled: {color: '#EA4335', bg: 'rgba(234,67,53,0.1)'},
};

const dates = buildUpcomingDates();

const slotDateTime = (day: {date: Date}, timeLabel: string) => {
  const t = TIME_TO_24H[timeLabel];
  const slot = new Date(day.date);
  slot.setHours(t.hours, t.minutes, 0, 0);
  return slot;
};

// Today's earlier slots (e.g. picking "10:00 AM" at 3 PM) produce a
// scheduled_at in the past, which the backend rejects — filter those out
// instead of letting the panel default to an already-invalid selection.
const availableTimeSlots = (dateNum: string) => {
  const day = dates.find(d => d.num === dateNum) ?? dates[0];
  return timeSlots.filter(t => slotDateTime(day, t).getTime() > Date.now());
};

// Rails validation errors can come back as a plain string, an array, or a
// {field: [messages]} hash — normalize whichever shape shows up so the user
// sees the actual reason instead of a generic fallback.
const extractErrorMessage = (error: any): string | null => {
  const data = error?.response?.data;
  if (!data) return null;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.errors)) return data.errors.join(', ');
  if (data.errors && typeof data.errors === 'object') {
    return Object.entries(data.errors)
      .map(([field, msgs]) =>
        `${field} ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
      )
      .join('; ');
  }
  return null;
};

const BookWorkshop = () => {
  const navigation = useNavigation();
  const [view, setView] = useState<'browse' | 'bookings'>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [workshops, setWorkshops] = useState<ApiWorkshop[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  const [bookingWorkshop, setBookingWorkshop] = useState<ApiWorkshop | null>(null);
  const [selectedDate, setSelectedDate] = useState(dates[0].num);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const loadWorkshops = async () => {
      setLoadingWorkshops(true);
      try {
        const fix = await requestCurrentLocation();
        setCoords(fix);
        if (!fix) {
          setWorkshops([]);
          return;
        }
        const {data} = await getWorkshops(fix);
        setWorkshops(data.workshops ?? []);
      } catch (error) {
        console.log('[BookWorkshop] failed to load workshops:', error);
        setWorkshops([]);
      } finally {
        setLoadingWorkshops(false);
      }
    };
    loadWorkshops();
  }, []);

  useEffect(() => {
    if (view !== 'bookings') return;
    const loadBookings = async () => {
      setLoadingBookings(true);
      try {
        const {data}: any = await getWorkshopBookings();
        const list = Array.isArray(data) ? data : data?.workshop_bookings ?? [];
        setMyBookings(list.map(normalizeBooking));
      } catch (error) {
        console.log('[BookWorkshop] failed to load bookings:', error);
        setMyBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    loadBookings();
  }, [view]);

  const filteredWorkshops = workshops.filter(w => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      w.name.toLowerCase().includes(q) || w.address.toLowerCase().includes(q)
    );
  });

  const selectableTimeSlots = availableTimeSlots(selectedDate);

  const openBookingPanel = (shop: ApiWorkshop) => {
    const firstDateWithSlot =
      dates.find(d => availableTimeSlots(d.num).length > 0) ?? dates[0];
    const slots = availableTimeSlots(firstDateWithSlot.num);
    setSelectedDate(firstDateWithSlot.num);
    setSelectedTime(slots[0] ?? timeSlots[0]);
    setDescription('');
    setBookingWorkshop(shop);
  };

  const handleSelectDate = (dateNum: string) => {
    setSelectedDate(dateNum);
    const slots = availableTimeSlots(dateNum);
    if (slots.length > 0 && !slots.includes(selectedTime)) {
      setSelectedTime(slots[0]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingWorkshop || submitting) return;
    if (!description.trim()) {
      Alert.alert('Description required', 'Please describe the issue.');
      return;
    }
    if (!coords) {
      Alert.alert(
        'Location required',
        'We need your location to book a workshop. Please enable location access and try again.',
      );
      return;
    }

    const chosenDay = dates.find(d => d.num === selectedDate) ?? dates[0];
    if (!selectableTimeSlots.includes(selectedTime)) {
      Alert.alert(
        'Pick a valid time',
        'That time slot has already passed — please choose an upcoming date/time.',
      );
      return;
    }
    const scheduledDate = slotDateTime(chosenDay, selectedTime);

    setSubmitting(true);
    try {
      const address =
        (await reverseGeocode(coords)) ?? 'Current location';
      await createWorkshopBooking({
        // GET /workshops returns both `id` (the workshop's own record id) and
        // `provider_profile_id` — the booking endpoint 404s with "Workshop
        // not found" against provider_profile_id, so it's keyed off `id`
        // despite the "provider_id" field name.
        provider_id: bookingWorkshop.id,
        description: description.trim(),
        scheduled_at: scheduledDate.toISOString(),
        customer_latitude: coords.latitude,
        customer_longitude: coords.longitude,
        customer_address: address,
      });
      Alert.alert('Booking requested', 'The workshop will confirm shortly.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      console.log(
        '[BookWorkshop] createWorkshopBooking failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
      Alert.alert(
        'Failed',
        extractErrorMessage(error) ?? 'Could not create booking. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <View style={{width: 44}} />
      </View>

      {/* ── Browse / My Bookings segmented control ── */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, view === 'browse' && styles.segmentBtnActive]}
          onPress={() => setView('browse')}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.segmentText,
              view === 'browse' && styles.segmentTextActive,
            ]}>
            Browse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, view === 'bookings' && styles.segmentBtnActive]}
          onPress={() => setView('bookings')}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.segmentText,
              view === 'bookings' && styles.segmentTextActive,
            ]}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'bookings' ? (
        loadingBookings ? (
          <View style={styles.centerFill}>
            <ActivityIndicator size="large" color="#E8490F" />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {myBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>
                  Book a workshop from the Browse tab
                </Text>
              </View>
            ) : (
              myBookings.map(b => {
                const statusStyle = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending;
                return (
                  <View key={b.id} style={styles.bookingCard}>
                    <View style={styles.bookingCardTop}>
                      <Text style={styles.bookingWorkshopName}>
                        {b.workshopName ?? 'Workshop'}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {backgroundColor: statusStyle.bg},
                        ]}>
                        <Text
                          style={[styles.statusBadgeText, {color: statusStyle.color}]}>
                          {b.status}
                        </Text>
                      </View>
                    </View>
                    {b.scheduledAt && (
                      <Text style={styles.bookingMeta}>
                        {new Date(b.scheduledAt).toLocaleString()}
                      </Text>
                    )}
                    {b.description ? (
                      <Text style={styles.bookingDescription}>{b.description}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
            <View style={{height: 32}} />
          </ScrollView>
        )
      ) : (
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
              placeholder="Search workshops, address..."
              placeholderTextColor={Colors.Grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="#E8490F"
            />
          </View>

          {/* ── Subtitle ── */}
          <Text style={styles.subtitle}>
            {loadingWorkshops
              ? 'Finding nearby workshops...'
              : `${filteredWorkshops.length} workshops nearby`}
          </Text>

          {/* ── Workshop List ── */}
          {loadingWorkshops ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color="#E8490F" />
            </View>
          ) : filteredWorkshops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏭</Text>
              <Text style={styles.emptyTitle}>No workshops found</Text>
              <Text style={styles.emptySubtitle}>
                {coords
                  ? 'Try again later or search a different area'
                  : 'Enable location access to find nearby workshops'}
              </Text>
            </View>
          ) : (
            <View style={styles.workshopList}>
              {filteredWorkshops.map(shop => (
                <View key={shop.id} style={styles.workshopCard}>
                  <View style={styles.shopRow}>
                    <View style={styles.shopAvatarWrapper}>
                      <Text style={styles.shopAvatarEmoji}>🏭</Text>
                    </View>

                    <View style={styles.shopDetails}>
                      <View style={styles.shopHeaderRow}>
                        <Text style={styles.shopName}>{shop.name}</Text>
                        <View style={styles.distanceBadge}>
                          <Text style={styles.distanceText}>
                            {shop.distance_km.toFixed(2)} km
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.shopLocation}>{shop.address}</Text>

                      <View style={styles.ratingRow}>
                        <Text style={styles.starIcon}>⭐</Text>
                        <Text style={styles.ratingText}>{shop.rating}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.statusText}>{shop.city}</Text>
                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      activeOpacity={0.8}
                      onPress={() => openBookingPanel(shop)}
                    >
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Select Date & Time (Bottom Interactive Panel) ── */}
          {bookingWorkshop && (
            <View style={styles.bookingPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelIcon}>📅</Text>
                <Text style={styles.panelTitle}>
                  Select Date & Time – {bookingWorkshop.name}
                </Text>
              </View>

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
                      onPress={() => handleSelectDate(d.num)}
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

              {selectableTimeSlots.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots left today — pick another date above.
                </Text>
              ) : (
                <View style={styles.timeSlotsRow}>
                  {selectableTimeSlots.map(t => {
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
              )}

              <TextInput
                style={styles.descriptionInput}
                placeholder="Describe the issue (e.g. oil leak, engine noise)"
                placeholderTextColor={Colors.Grey}
                value={description}
                onChangeText={setDescription}
                multiline
                selectionColor="#E8490F"
              />

              <TouchableOpacity
                style={[styles.confirmBookingBtn, submitting && styles.confirmBookingBtnDisabled]}
                activeOpacity={0.85}
                disabled={submitting}
                onPress={handleConfirmBooking}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBookingBtnText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
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
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#E8490F',
  },
  segmentText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  centerFill: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {alignItems: 'center', paddingTop: 60, gap: 10},
  emptyIcon: {fontSize: 48},
  emptyTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
  },
  emptySubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    textAlign: 'center',
    paddingHorizontal: 32,
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
    backgroundColor: '#E8490F',
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
    flex: 1,
    marginRight: 8,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  statusText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
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
    flex: 1,
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
    marginBottom: 16,
  },
  noSlotsText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 16,
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
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 14,
    padding: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  confirmBookingBtn: {
    backgroundColor: '#E8490F',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBookingBtnDisabled: {
    opacity: 0.6,
  },
  confirmBookingBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  /* ── My Bookings ── */
  bookingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    marginBottom: 14,
  },
  bookingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingWorkshopName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  statusBadgeText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  bookingMeta: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 6,
  },
  bookingDescription: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 19,
  },
});
