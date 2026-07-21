import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Switch,
  ScrollView,
  Alert,
  InteractionManager,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  Bell,
  Star,
  Briefcase,
  ChevronRight,
  Zap,
  Truck,
  Battery,
  Fuel,
  Settings,
  LocateFixed,
} from 'lucide-react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  requestCurrentLocation,
  reverseGeocode,
  Coordinates,
} from '../../../utils/location';
import {mapDarkStyle} from '../../../generalStyles/mapDarkStyle';
import {
  getCurrentUser,
  setProviderOnlineStatus,
  getProviderJobs,
} from '../../../requestHandler/api';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {setUser} from '../../../redux/slices/authSlice';
import {setVerified} from '../../../redux/slices/providerSlice';
import {normalizeProviderJob, findPendingJob} from '../../../utils/providerJob';
import {loadDismissedAssignmentIds} from '../../../utils/dismissedJobs';

const DEFAULT_COORDS: Coordinates = {latitude: 31.5204, longitude: 74.3587};
const JOB_POLL_INTERVAL_MS = 8000;

const ProviderHome: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const [isOnline, setIsOnline] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [recentering, setRecentering] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [checkingJobs, setCheckingJobs] = useState(false);
  const [todayJobs] = useState(3);
  const [todayEarnings] = useState('PKR 4,200');
  const [rating] = useState(4.8);
  const mapRef = useRef<MapView>(null);
  const coordsRef = useRef(coords);
  const seenAssignmentIds = useRef(new Set<string>());

  coordsRef.current = coords;

  // Merge in assignment ids this provider already declined on any previous
  // app run (see utils/dismissedJobs.ts) — without this, restarting the app
  // clears the in-memory seenAssignmentIds set below and a declined job can
  // resurface as if it were a brand-new request.
  useEffect(() => {
    let cancelled = false;
    loadDismissedAssignmentIds().then(ids => {
      if (!cancelled) {
        ids.forEach(id => seenAssignmentIds.current.add(id));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const goToCurrentLocation = useCallback((fresh: Coordinates) => {
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

  // Polls the same GET /provider/jobs the "My Jobs" tab uses, and pushes the
  // provider straight into the incoming-job sheet the moment a new pending
  // assignment shows up — this stands in for a push/websocket notification
  // that doesn't exist yet on the backend.
  const checkForJobs = useCallback(async () => {
    setCheckingJobs(true);
    try {
      const {data}: any = await getProviderJobs();
      const jobsList: any[] = Array.isArray(data) ? data : data?.jobs ?? [];
      const pending = findPendingJob(jobsList);
      if (pending && !seenAssignmentIds.current.has(pending.assignment_id)) {
        seenAssignmentIds.current.add(pending.assignment_id);
        navigation.navigate('ProviderIncomingJob', {
          job: normalizeProviderJob(pending, coordsRef.current ?? undefined),
        });
      }
      return pending;
    } catch (error: any) {
      console.log(
        '[ProviderHome] getProviderJobs failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
      return null;
    } finally {
      setCheckingJobs(false);
    }
  }, [navigation]);

  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(checkForJobs, JOB_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isOnline, checkForJobs]);

  // Mirrors the customer Home screen: forceRefresh on every focus (instead of
  // a plain useEffect-on-mount) so the banner tracks real movement instead of
  // showing a stale fix from whenever the app first launched.
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(async () => {
        const location = await requestCurrentLocation(true);
        setCoords(location);
        setLocationLoading(false);
        if (location) {
          setPlaceName(await reverseGeocode(location));
        }
      });
      return () => task.cancel();
    }, []),
  );

  useEffect(() => {
    // Home and Profile share the same auth/provider Redux state as their
    // single source of truth — this refresh just keeps it current.
    getCurrentUser()
      .then(({data}) => {
        dispatch(
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role as 'customer' | 'provider',
          }),
        );
        dispatch(setVerified(data.user.status === 'active'));
      })
      .catch(() => {});
  }, [dispatch]);

  const handleRecenter = async () => {
    setRecentering(true);
    const location = await requestCurrentLocation(true);
    setRecentering(false);
    if (!location) return;
    setCoords(location);
    goToCurrentLocation(location);
    setPlaceName(await reverseGeocode(location));
  };

  const handleToggleOnline = async (goOnline: boolean) => {
    setTogglingOnline(true);
    try {
      let liveCoords = coords;
      if (goOnline) {
        liveCoords = await requestCurrentLocation();
        if (!liveCoords) {
          Alert.alert(
            'Location required',
            'Enable location permission to go online — customers need your position to find you.',
          );
          return;
        }
        setCoords(liveCoords);
      }
      await setProviderOnlineStatus(
        goOnline
          ? {
              is_online: true,
              current_lat: liveCoords?.latitude,
              current_lng: liveCoords?.longitude,
            }
          : {is_online: false},
      );
      setIsOnline(goOnline);
    } catch (error: any) {
      console.warn(
        '[provider/online] failed:',
        error?.response?.status,
        error?.response?.data ?? error?.message,
      );
      Alert.alert(
        'Something went wrong',
        error?.response?.data?.errors?.join(', ') ??
          error?.response?.data?.error ??
          'Could not update your status. Please try again.',
      );
    } finally {
      setTogglingOnline(false);
    }
  };

  const services = [
    {name: 'Towing', icon: Truck, color: '#E8490F'},
    {name: 'Battery Jump', icon: Battery, color: '#F59E0B'},
    {name: 'Fuel Delivery', icon: Fuel, color: '#10B981'},
  ];

  const recentJobs = [
    {id: 1, type: 'Towing', customer: 'Ahmad Ali', time: '2:30 PM', amount: 'PKR 2,000', status: 'Completed'},
    {id: 2, type: 'Battery Jump', customer: 'Sara Khan', time: '11:00 AM', amount: 'PKR 800', status: 'Completed'},
    {id: 3, type: 'Fuel Delivery', customer: 'Usman Raza', time: '9:15 AM', amount: 'PKR 500', status: 'Cancelled'},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Background Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        initialRegion={{
          latitude: (coords ?? DEFAULT_COORDS).latitude,
          longitude: (coords ?? DEFAULT_COORDS).longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapDarkStyle}>
        <Marker coordinate={coords ?? DEFAULT_COORDS}>
          <View style={[styles.providerDot, isOnline && styles.providerDotOnline]} />
        </Marker>
      </MapView>

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">

        {/* ── Header ── */}
        <View style={styles.topContainer} pointerEvents="box-none">
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>
                {isOnline ? "🟢 You're Online" : "🔴 You're Offline"}
              </Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <Bell size={20} color={Colors.White} strokeWidth={1.8} />
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                <Settings size={20} color={Colors.White} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Row — tap to recenter the map on your current position */}
          <TouchableOpacity
            style={styles.locationBanner}
            activeOpacity={0.8}
            onPress={handleRecenter}
            disabled={recentering}>
            <View style={styles.locationLeft}>
              <View style={styles.locationIconWrap}>
                <LocateFixed size={16} color="#E8490F" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.locationLabel}>Your Location</Text>
                <Text style={styles.locationText}>
                  {recentering
                    ? 'Locating…'
                    : locationLoading
                    ? 'Detecting…'
                    : placeName
                    ? placeName
                    : coords
                    ? `${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`
                    : 'Location unavailable'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.GreyText} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        {/* ── Bottom Dashboard ── */}
        <ScrollView
          style={styles.bottomScroll}
          contentContainerStyle={styles.bottomContent}
          showsVerticalScrollIndicator={false}
          pointerEvents="box-none">

          {/* ── Online Toggle Card ── */}
          <View style={[styles.toggleCard, isOnline && styles.toggleCardOnline]}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleDot, isOnline && styles.toggleDotOn]} />
              <View>
                <Text style={styles.toggleTitle}>
                  {isOnline ? 'You are Online' : 'Go Online to Accept Jobs'}
                </Text>
                <Text style={styles.toggleSubtitle}>
                  {isOnline
                    ? 'Customers nearby can now find you'
                    : 'Toggle to start receiving job requests'}
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{false: '#2C2C2E', true: '#E8490F'}}
              thumbColor={isOnline ? '#FFFFFF' : '#8E8E93'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={handleToggleOnline}
              value={isOnline}
              disabled={togglingOnline}
            />
          </View>

          {/* ── Manual "check now" — the interval above already polls this
              automatically every few seconds while online, this just lets
              the provider force an immediate check instead of waiting. ── */}
          {isOnline && (
            <TouchableOpacity
              style={styles.simulateJobBtn}
              activeOpacity={0.85}
              disabled={checkingJobs}
              onPress={async () => {
                const pending = await checkForJobs();
                if (!pending) {
                  Alert.alert('No Jobs Yet', 'No pending job requests right now.');
                }
              }}>
              <Zap size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.simulateJobBtnText}>
                {checkingJobs ? 'Checking…' : 'Check for New Jobs'}
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Stats Row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayJobs}</Text>
              <Text style={styles.statLabel}>Today's Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayEarnings}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.statValue}>{rating}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* ── My Services ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Services</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesRow}>
            {services.map(svc => {
              const Icon = svc.icon;
              return (
                <View key={svc.name} style={styles.serviceChip}>
                  <Icon size={14} color={svc.color} strokeWidth={2} />
                  <Text style={styles.serviceChipText}>{svc.name}</Text>
                </View>
              );
            })}
          </View>

          {/* ── Recent Jobs ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Jobs</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentJobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              activeOpacity={0.85}>
              <View style={styles.jobIconWrap}>
                <Briefcase size={18} color="#E8490F" strokeWidth={2} />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobType}>{job.type}</Text>
                <Text style={styles.jobMeta}>{job.customer} · {job.time}</Text>
              </View>
              <View style={styles.jobRight}>
                <Text style={styles.jobAmount}>{job.amount}</Text>
                <View
                  style={[
                    styles.jobStatusBadge,
                    {
                      backgroundColor:
                        job.status === 'Completed'
                          ? 'rgba(16,185,129,0.1)'
                          : 'rgba(234,67,53,0.1)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.jobStatusText,
                      {color: job.status === 'Completed' ? '#10B981' : '#EA4335'},
                    ]}>
                    {job.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Offline Warning */}
          {!isOnline && (
            <TouchableOpacity
              style={styles.offlineBanner}
              onPress={() => handleToggleOnline(true)}
              activeOpacity={0.8}>
              <Zap size={18} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.offlineBannerText}>
                Tap to go online and start receiving job requests
              </Text>
            </TouchableOpacity>
          )}

          <View style={{height: 20}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProviderHome;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111214'},
  safeArea: {flex: 1, zIndex: 1},
  providerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8E8E93',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  providerDotOnline: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
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
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 3,
  },
  userName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 22,
    color: Colors.White,
  },
  headerRight: {flexDirection: 'row', gap: 10},
  iconBtn: {
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
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  locationLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,73,15,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
    marginBottom: 2,
  },
  locationText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.White,
  },
  bottomScroll: {maxHeight: 440},
  bottomContent: {paddingHorizontal: 20, paddingTop: 14},
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 14,
  },
  toggleCardOnline: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  toggleLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8E8E93',
  },
  toggleDotOn: {backgroundColor: '#10B981'},
  toggleTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 3,
  },
  toggleSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  statCard: {flex: 1, alignItems: 'center'},
  statDivider: {width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.07)'},
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  statValue: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  seeAll: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#E8490F',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  serviceChipText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.White,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  jobIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {flex: 1},
  jobType: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
    marginBottom: 3,
  },
  jobMeta: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  jobRight: {alignItems: 'flex-end', gap: 5},
  jobAmount: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
  },
  jobStatusBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  jobStatusText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 11,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    padding: 14,
    marginTop: 6,
  },
  offlineBannerText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 20,
  },
  simulateJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 14,
    shadowColor: '#E8490F',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 5},
    elevation: 7,
  },
  simulateJobBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
