import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
  InteractionManager,
  Modal,
  FlatList,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  requestCurrentLocation,
  reverseGeocode,
  Coordinates,
} from '../../../utils/location';
import {
  createServiceRequest,
  cancelServiceRequest,
  getServiceCategories,
  getServiceRequests,
  getVehicles,
} from '../../../requestHandler/api';
import {iconForCategory, labelForCategory} from '../../../utils/serviceCategory';

interface IssueOption {
  id: string;
  label: string;
  icon: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
}

// Shown while GET /service_categories is loading / if it fails — keeps the
// picker usable, but real IDs from the server always take priority once fetched.
const FALLBACK_ISSUES: IssueOption[] = [
  {id: 'flat_tyre', label: 'Flat Tyre', icon: '⚙️'},
  {id: 'dead_battery', label: 'Dead Battery', icon: '🔋'},
  {id: 'overheating', label: 'Overheating', icon: '🌡️'},
  {id: 'out_of_fuel', label: 'Out of Fuel', icon: '⛽'},
  {id: 'ac_issue', label: 'AC Issue', icon: '💨'},
  {id: 'other', label: 'Other', icon: '❓'},
];

const RequestHelp = () => {
  const navigation = useNavigation<any>();
  const [issues, setIssues] = useState<IssueOption[]>(FALLBACK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<string>('flat_tyre');
  const [notes, setNotes] = useState<string>('');
  const [smsFallback, setSmsFallback] = useState<boolean>(true);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeRequestStatus, setActiveRequestStatus] = useState<
    string | null
  >(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(false);
    setPlaceName(null);
    const coords = await requestCurrentLocation();
    setLocation(coords);
    setLocationLoading(false);
    setLocationError(!coords);
    if (coords) {
      setPlaceName(await reverseGeocode(coords));
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const {data}: any = await getServiceCategories();
      const categories = data?.service_categories ?? [];
      if (categories.length > 0) {
        setIssues(
          categories.map((c: any) => ({
            id: c.id,
            label: labelForCategory(c.name),
            icon: iconForCategory(c.name),
          })),
        );
        setSelectedIssue(categories[0].id);
      }
    } catch (error: any) {
      // Keep the fallback issue list — user can still pick something and
      // submit; the backend will just reject an unrecognized category id.
      console.log(
        '[RequestHelp] getServiceCategories failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
    }

    setVehiclesLoading(true);
    try {
      const {data}: any = await getVehicles();
      const list: Vehicle[] = data?.vehicles ?? [];
      setVehicles(list);
      setSelectedVehicleId(prev => prev ?? list[0]?.id ?? null);
    } catch (error: any) {
      console.log(
        '[RequestHelp] getVehicles failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  // useFocusEffect (not useEffect-on-mount) + runAfterInteractions: kicking off
  // the permission prompt/GPS call while the push transition is still animating
  // can get it silently dropped or stalled (seen on Android in particular).
  // Waiting for the screen to be focused and interactions to settle first, and
  // re-fetching on every focus, makes this reliable across back-and-forth nav.
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        fetchLocation();
        fetchOptions();
      });
      return () => task.cancel();
    }, [fetchLocation, fetchOptions]),
  );

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert(
        'Location required',
        'We need your location to request help.',
      );
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert(
        'Vehicle required',
        'Add a vehicle to your profile before requesting help.',
      );
      return;
    }
    const issue = issues.find(i => i.id === selectedIssue);
    setSubmitting(true);
    try {
      // Re-fetch right before submitting instead of trusting whatever was
      // cached when the screen loaded — this is what's sent to the backend
      // and matched against nearby providers, so it must be the user's
      // actual current position, not a fix from up to a minute ago.
      const freshLocation = (await requestCurrentLocation(true)) ?? location;
      const address =
        (await reverseGeocode(freshLocation)) ??
        `${freshLocation.latitude.toFixed(
          5,
        )}, ${freshLocation.longitude.toFixed(5)}`;

      const {data}: any = await createServiceRequest({
        service_category_id: selectedIssue,
        vehicle_id: selectedVehicleId,
        description: notes || issue?.label || 'Roadside assistance needed',
        latitude: freshLocation.latitude,
        longitude: freshLocation.longitude,
        address,
      });
      setActiveRequestId(data?.service_request?.id ?? null);
    } catch (error: any) {
      console.log(
        '[RequestHelp] createServiceRequest failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
      const serverMessage =
        error?.response?.data?.error ??
        error?.response?.data?.errors?.join?.(', ');
      Alert.alert(
        'Request failed',
        serverMessage ?? 'Could not reach the server. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Polls the same GET /service_requests list used elsewhere in the app (no
  // GET /service_requests/:id in the Postman collection) to notice once a
  // provider accepts, so the "Track Provider" entry point can appear without
  // the user having to back out and re-open this screen.
  //
  // Deliberately a plain useEffect keyed on activeRequestId, NOT
  // useFocusEffect — this screen doesn't navigate anywhere while waiting, so
  // there's no focus/blur transition to hook into, and tying a network poll
  // to react-navigation's focus-effect internals only adds a moving part
  // that isn't needed here.
  useEffect(() => {
    if (!activeRequestId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const {data}: any = await getServiceRequests();
        const list: any[] = data?.service_requests ?? [];
        const sr = list.find(r => r.id === activeRequestId);
        if (cancelled) return;
        if (sr) {
          console.log('[RequestHelp] status poll ->', sr.status);
          setActiveRequestStatus(sr.status);
        } else {
          console.log(
            '[RequestHelp] status poll: request not found in list, count =',
            list.length,
          );
        }
      } catch (error: any) {
        console.log(
          '[RequestHelp] status poll failed:',
          error?.response?.status,
          error?.response?.data ?? error?.message,
        );
      }
    };
    poll();
    const id = setInterval(poll, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeRequestId]);

  // Whitelist the statuses that actually mean "a provider is on this job",
  // rather than blacklisting 'pending'/'completed'/'cancelled' — a blacklist
  // treats any status it doesn't recognize (including a casing mismatch like
  // 'Pending' vs 'pending') as trackable, which is what caused the "Provider
  // on the way" alert to fire immediately on submission instead of waiting
  // for a provider to actually accept.
  const canTrack =
    activeRequestStatus != null &&
    ['accepted', 'on_the_way'].includes(activeRequestStatus.toLowerCase());

  // The poll above updates activeRequestStatus silently — without this, a
  // customer sitting on this screen has no way to notice a provider accepted
  // besides spotting the "Track Provider" button quietly appearing. Fire an
  // alert once per request the moment it flips into an accepted state.
  const notifiedAcceptedRef = useRef(false);
  useEffect(() => {
    if (!canTrack || notifiedAcceptedRef.current) return;
    notifiedAcceptedRef.current = true;
    Alert.alert(
      'Provider on the way',
      'A mechanic has accepted your request.',
      [
        {
          text: 'Track Provider',
          onPress: () =>
            navigation.navigate('LiveTracking', {requestId: activeRequestId}),
        },
      ],
    );
  }, [canTrack, activeRequestId, navigation]);

  useEffect(() => {
    notifiedAcceptedRef.current = false;
  }, [activeRequestId]);

  const handleCancel = () => {
    if (!activeRequestId) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this help request?',
      [
        {text: 'Keep Waiting', style: 'cancel'},
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelServiceRequest(activeRequestId);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Could not cancel',
                'Please try again in a moment.',
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Help</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Emergency Mode Active Banner ── */}
        <View style={styles.emergencyBanner}>
          <View style={styles.sosBadge}>
            <Text style={styles.sosBadgeText}>SOS</Text>
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {canTrack
                ? 'Provider On The Way'
                : activeRequestId
                ? 'Request Sent'
                : 'Emergency Mode Active'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {canTrack
                ? 'A mechanic has accepted your request'
                : activeRequestId
                ? 'Waiting for a nearby mechanic to accept'
                : 'Mechanics nearby are being alerted'}
            </Text>
          </View>
        </View>

        {/* ── Location Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>
              📍 Your Location (Auto-detected)
            </Text>
          </View>
          {locationLoading ? (
            <View style={styles.locationLoadingRow}>
              <ActivityIndicator color="#E8490F" size="small" />
              <Text style={styles.locationLoadingText}>
                Detecting your location…
              </Text>
            </View>
          ) : location ? (
            <Text style={styles.coordinates}>
              {placeName ??
                `${location.latitude.toFixed(
                  4,
                )}° N, ${location.longitude.toFixed(4)}° E`}
            </Text>
          ) : (
            <Text style={styles.coordinates}>
              {locationError
                ? 'Could not detect location'
                : 'Location unavailable'}
            </Text>
          )}
          {locationError ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cardLinkContainer}
              onPress={fetchLocation}>
              <Text style={styles.cardLinkText}>↻ Retry</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cardLinkContainer}>
              <Text style={styles.cardLinkText}>✏️ Correct Location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Select Vehicle Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>🚗 Select Vehicle</Text>
          </View>
          {vehiclesLoading ? (
            <View style={styles.locationLoadingRow}>
              <ActivityIndicator color="#E8490F" size="small" />
              <Text style={styles.locationLoadingText}>
                Loading your vehicles…
              </Text>
            </View>
          ) : selectedVehicle ? (
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleLeft}>
                <View style={styles.vehicleIconWrapper}>
                  <Text style={styles.vehicleIcon}>🚙</Text>
                </View>
                <View>
                  <Text style={styles.vehicleName}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </Text>
                  <Text style={styles.vehicleSubtext}>
                    {selectedVehicle.registration_number} ·{' '}
                    {selectedVehicle.year}
                  </Text>
                </View>
              </View>
              {vehicles.length > 1 ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setVehiclePickerOpen(true)}>
                  <Text style={styles.changeLinkText}>Change</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <Text style={styles.coordinates}>
              No saved vehicles — add one from your profile first.
            </Text>
          )}
        </View>

        {/* ── What's the issue? ── */}
        <View style={styles.issueSection}>
          <Text style={styles.sectionTitle}>What's the issue?</Text>
          <View style={styles.issueGrid}>
            {issues.map(item => {
              const isSelected = selectedIssue === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.issueGridItem,
                    isSelected
                      ? styles.issueItemActive
                      : styles.issueItemInactive,
                  ]}
                  onPress={() => setSelectedIssue(item.id)}
                  activeOpacity={0.8}>
                  <Text style={styles.issueIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.issueLabel,
                      isSelected
                        ? styles.issueLabelActive
                        : styles.issueLabelInactive,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Additional Notes ── */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Additional Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Car won't move, stuck near flyover..."
            placeholderTextColor={Colors.Grey}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            selectionColor="#E8490F"
          />
        </View>

        {/* ── Offline SMS Fallback ── */}
        <View style={styles.smsBanner}>
          <View style={styles.smsLeft}>
            <View style={styles.smsIconWrapper}>
              <Text style={styles.smsIcon}>📱</Text>
            </View>
            <View>
              <Text style={styles.smsTitle}>Offline SMS Fallback</Text>
              <Text style={styles.smsSubtitle}>
                Alert saved contacts via SMS
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{false: '#2C2C2E', true: '#E8490F'}}
            thumbColor={smsFallback ? '#FFFFFF' : '#8E8E93'}
            ios_backgroundColor="#2C2C2E"
            onValueChange={setSmsFallback}
            value={smsFallback}
          />
        </View>

        {/* Spacer to push down button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Bottom Button ── */}
      <View style={styles.bottomBtnContainer}>
        {activeRequestId ? (
          <View style={styles.activeRequestBtnRow}>
            {canTrack ? (
              <TouchableOpacity
                style={[styles.primaryBtn, styles.rowBtn, styles.trackBtn]}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('LiveTracking', {
                    requestId: activeRequestId,
                  })
                }>
                <Text style={styles.primaryBtnText}>Track Provider</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                canTrack && styles.rowBtn,
                styles.cancelBtn,
                cancelling && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={cancelling}
              onPress={handleCancel}>
              {cancelling ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Cancel Request</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              submitting && styles.primaryBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Request Help Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Vehicle Picker ── */}
      <Modal
        visible={vehiclePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setVehiclePickerOpen(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setVehiclePickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            <FlatList
              data={vehicles}
              keyExtractor={v => v.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalVehicleRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedVehicleId(item.id);
                    setVehiclePickerOpen(false);
                  }}>
                  <Text style={styles.vehicleIcon}>🚙</Text>
                  <View style={styles.modalVehicleTextWrap}>
                    <Text style={styles.vehicleName}>
                      {item.make} {item.model}
                    </Text>
                    <Text style={styles.vehicleSubtext}>
                      {item.registration_number} · {item.year}
                    </Text>
                  </View>
                  {item.id === selectedVehicleId ? (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default RequestHelp;

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
  headerPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  /* ── Emergency Banner ── */
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 67, 53, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sosBadge: {
    backgroundColor: '#EA4335',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 14,
  },
  sosBadgeText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: '#EA4335',
    fontWeight: '700',
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
  },
  /* ── Cards ── */
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
  },
  coordinates: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.Grey || '#868686',
    marginBottom: 12,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationLoadingText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.Grey || '#868686',
  },
  cardLinkContainer: {
    alignSelf: 'flex-start',
  },
  cardLinkText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: '#E8490F',
    fontWeight: '600',
  },
  /* ── Vehicle ── */
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  vehicleIcon: {
    fontSize: 22,
  },
  vehicleName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: Colors.White || '#FFFFFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleSubtext: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
  },
  changeLinkText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: '#E8490F',
    fontWeight: '600',
  },
  /* ── Issues ── */
  issueSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 20,
    color: Colors.White || '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  issueGridItem: {
    width: '48%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  issueItemInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'transparent',
  },
  issueItemActive: {
    backgroundColor: 'rgba(232, 73, 15, 0.08)',
    borderColor: '#E8490F',
  },
  issueIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  issueLabel: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 15,
    fontWeight: '600',
  },
  issueLabelInactive: {
    color: Colors.White || '#FFFFFF',
  },
  issueLabelActive: {
    color: '#E8490F',
  },
  /* ── Notes ── */
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
  },
  /* ── SMS ── */
  smsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  smsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  smsIcon: {
    fontSize: 18,
  },
  smsTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
    marginBottom: 2,
  },
  smsSubtitle: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  bottomSpacer: {
    height: 60,
  },
  /* ── Bottom Button ── */
  bottomBtnContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    backgroundColor: Colors.bgColor || '#030005',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    backgroundColor: '#EA4335',
    shadowColor: '#EA4335',
  },
  activeRequestBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowBtn: {
    flex: 1,
    width: undefined,
  },
  trackBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  /* ── Vehicle Picker Modal ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111014',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalVehicleTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  modalCheckmark: {
    color: '#E8490F',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
