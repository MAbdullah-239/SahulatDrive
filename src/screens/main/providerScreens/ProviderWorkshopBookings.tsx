import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {ArrowLeft, Calendar, MapPin, CheckCircle, X} from 'lucide-react-native';
import {
  getProviderWorkshopBookings,
  updateProviderWorkshopBooking,
} from '../../../requestHandler/api';

interface Booking {
  id: string;
  description: string;
  scheduledAt: string | null;
  status: string;
  customerAddress: string;
  customerName: string | null;
}

const normalizeBooking = (raw: any): Booking => ({
  id: raw.id,
  description: raw.description ?? '',
  scheduledAt: raw.scheduled_at ?? null,
  status: raw.status ?? 'pending',
  customerAddress: raw.customer_address ?? '',
  customerName: raw.customer?.name ?? null,
});

const STATUS_COLORS: Record<string, {color: string; bg: string}> = {
  pending: {color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'},
  accepted: {color: '#10B981', bg: 'rgba(16,185,129,0.1)'},
  rejected: {color: '#EA4335', bg: 'rgba(234,67,53,0.1)'},
  completed: {color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'},
  cancelled: {color: '#EA4335', bg: 'rgba(234,67,53,0.1)'},
};

const ProviderWorkshopBookings: React.FC = () => {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const {data}: any = await getProviderWorkshopBookings();
      const list = Array.isArray(data) ? data : data?.workshop_bookings ?? [];
      setBookings(list.map(normalizeBooking));
    } catch (error) {
      console.log('[ProviderWorkshopBookings] failed to load:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAccept = async (booking: Booking) => {
    if (actioningId) return;
    setActioningId(booking.id);
    try {
      await updateProviderWorkshopBooking(booking.id, {status: 'accepted'});
      setBookings(prev =>
        prev.map(b => (b.id === booking.id ? {...b, status: 'accepted'} : b)),
      );
    } catch (error: any) {
      Alert.alert(
        'Failed',
        error?.response?.data?.error ?? 'Could not accept booking. Try again.',
      );
    } finally {
      setActioningId(null);
    }
  };

  const openReject = (booking: Booking) => {
    setRejectionReason('');
    setRejectTarget(booking);
  };

  const submitReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) {
      Alert.alert('Reason required', 'Please provide a rejection reason.');
      return;
    }
    setActioningId(rejectTarget.id);
    try {
      await updateProviderWorkshopBooking(rejectTarget.id, {
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
      });
      setBookings(prev =>
        prev.map(b =>
          b.id === rejectTarget.id ? {...b, status: 'rejected'} : b,
        ),
      );
      setRejectTarget(null);
    } catch (error: any) {
      Alert.alert(
        'Failed',
        error?.response?.data?.error ?? 'Could not reject booking. Try again.',
      );
    } finally {
      setActioningId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.White} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workshop Bookings</Text>
        <View style={{width: 44}} />
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#E8490F" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>
                Customer workshop bookings will show up here
              </Text>
            </View>
          ) : (
            bookings.map(booking => {
              const statusStyle =
                STATUS_COLORS[booking.status] ?? STATUS_COLORS.pending;
              const isPending = booking.status === 'pending';
              const busy = actioningId === booking.id;
              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.customerName}>
                      {booking.customerName ?? 'Customer'}
                    </Text>
                    <View
                      style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
                      <Text
                        style={[styles.statusBadgeText, {color: statusStyle.color}]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  {booking.scheduledAt && (
                    <View style={styles.infoRow}>
                      <Calendar size={13} color={Colors.GreyText} strokeWidth={1.8} />
                      <Text style={styles.infoText}>
                        {new Date(booking.scheduledAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {booking.customerAddress ? (
                    <View style={styles.infoRow}>
                      <MapPin size={13} color={Colors.GreyText} strokeWidth={1.8} />
                      <Text style={styles.infoText}>{booking.customerAddress}</Text>
                    </View>
                  ) : null}
                  {booking.description ? (
                    <Text style={styles.description}>{booking.description}</Text>
                  ) : null}

                  {isPending && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => openReject(booking)}
                        disabled={busy}
                        activeOpacity={0.8}>
                        <X size={15} color="#EA4335" strokeWidth={2.2} />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => handleAccept(booking)}
                        disabled={busy}
                        activeOpacity={0.8}>
                        {busy ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <CheckCircle size={15} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.acceptBtnText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{height: 24}} />
        </ScrollView>
      )}

      <Modal
        visible={rejectTarget !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setRejectTarget(null)}>
        <View style={ms.backdrop}>
          <TouchableOpacity
            style={ms.flex}
            activeOpacity={1}
            onPress={() => setRejectTarget(null)}
          />
          <View style={ms.sheet}>
            <View style={ms.indicator} />
            <Text style={ms.sheetTitle}>Reject Booking</Text>
            <Text style={ms.sheetSubtitle}>
              Let the customer know why this booking can't be accepted.
            </Text>
            <TextInput
              style={ms.input}
              placeholder="e.g. Slot unavailable due to workshop closing time"
              placeholderTextColor={Colors.Grey}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              selectionColor="#E8490F"
            />
            <TouchableOpacity
              style={ms.submitBtn}
              onPress={submitReject}
              disabled={actioningId !== null}
              activeOpacity={0.85}>
              {actioningId !== null ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={ms.submitBtnText}>Submit Rejection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProviderWorkshopBookings;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
  },
  centerFill: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 16},
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
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
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
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6},
  infoText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    flex: 1,
  },
  description: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 19,
    marginTop: 4,
  },
  actionRow: {flexDirection: 'row', gap: 10, marginTop: 14},
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
  },
  rejectBtn: {
    backgroundColor: 'rgba(234,67,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234,67,53,0.3)',
  },
  rejectBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: '#EA4335',
  },
  acceptBtn: {backgroundColor: '#10B981'},
  acceptBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

const ms = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,0,5,0.78)',
    justifyContent: 'flex-end',
  },
  flex: {flex: 1},
  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: Colors.White,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#EA4335',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
