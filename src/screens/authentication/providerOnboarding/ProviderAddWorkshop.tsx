import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {registerWorkshop} from '../../../requestHandler/api';
import {
  Coordinates,
  requestCurrentLocation,
  reverseGeocode,
} from '../../../utils/location';

const ProviderAddWorkshop: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const {categories = []} = route.params || {};

  const [workshopName, setWorkshopName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // The workshop's location is a fixed physical address, captured once here
  // and never updated again — unlike the provider's own live GPS ping used
  // for tow jobs, there's no ongoing tracking for a workshop.
  const captureLocation = async () => {
    setLocating(true);
    const fix = await requestCurrentLocation(true);
    setCoords(fix);
    if (fix) {
      const place = await reverseGeocode(fix);
      if (place) setAddress(prev => prev || place);
    }
    setLocating(false);
  };

  useEffect(() => {
    captureLocation();
  }, []);

  const isComplete =
    workshopName.trim().length > 0 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    coords != null;

  const handleContinue = async () => {
    if (!coords) {
      Alert.alert(
        'Location required',
        'We need your workshop location — tap Retry to capture it again.',
      );
      return;
    }

    setSubmitting(true);
    try {
      await registerWorkshop({
        workshop_name: workshopName.trim(),
        workshop_address: address.trim(),
        workshop_city: city.trim(),
        workshop_lat: coords.latitude,
        workshop_lng: coords.longitude,
      });

      navigation.navigate(
        AuthStack.nestedScreens.ProviderUploadDocuments.name,
        {categories},
      );
    } catch (err: any) {
      console.error('[ProviderAddWorkshop]', err?.response?.data ?? err);
      const backendMessage =
        err?.response?.data?.error ?? err?.response?.data?.message;
      Alert.alert(
        'Something went wrong',
        backendMessage ??
          'Could not save your workshop details. Please check your connection and try again.',
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
          activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.stepRow}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={[
                styles.stepDot,
                s <= 2 && styles.stepDotActive,
                s === 2 && styles.stepDotCurrent,
              ]}
            />
          ))}
        </View>
        <View style={{width: 44}} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Title ── */}
        <View style={styles.titleArea}>
          <Text style={styles.stepLabel}>Step 2 of 3 — Workshop Only</Text>
          <Text style={styles.title}>Set Up Your{'\n'}Workshop</Text>
          <Text style={styles.subtitle}>
            Tell us about your workshop. Its location is captured once here and
            won't need to be updated again.
          </Text>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteIcon}>🔧</Text>
          <Text style={styles.noteText}>
            Only providers offering{' '}
            <Text style={styles.orange}>workshop / mechanic</Text> services need
            to set up a workshop location.
          </Text>
        </View>

        {/* ── Workshop Name ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workshop Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Fast Fix Workshop"
              placeholderTextColor={Colors.Grey}
              selectionColor="#E8490F"
              value={workshopName}
              onChangeText={setWorkshopName}
            />
          </View>
        </View>

        {/* ── Address ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workshop Address</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Workshop Road, Lahore"
              placeholderTextColor={Colors.Grey}
              selectionColor="#E8490F"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* ── City ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Lahore"
              placeholderTextColor={Colors.Grey}
              selectionColor="#E8490F"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* ── Location capture status ── */}
        <View style={styles.locationCard}>
          <View style={styles.locationLeft}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={{flex: 1}}>
              <Text style={styles.locationTitle}>Workshop Location</Text>
              {locating ? (
                <Text style={styles.locationSubtitle}>
                  Capturing GPS location…
                </Text>
              ) : coords ? (
                <Text style={styles.locationSubtitle}>
                  Captured — {coords.latitude.toFixed(5)},{' '}
                  {coords.longitude.toFixed(5)}
                </Text>
              ) : (
                <Text style={styles.locationSubtitleError}>
                  Could not get your location
                </Text>
              )}
            </View>
          </View>
          {locating ? (
            <ActivityIndicator color="#E8490F" size="small" />
          ) : (
            <TouchableOpacity onPress={captureLocation} activeOpacity={0.7}>
              <Text style={styles.retryLink}>↻ Retry</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!isComplete || submitting) && styles.primaryBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isComplete || submitting}
          activeOpacity={0.85}>
          {submitting ? (
            <ActivityIndicator color={Colors.White} />
          ) : (
            <Text style={styles.primaryBtnText}>Next → Upload Documents</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderAddWorkshop;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {color: Colors.White, fontSize: 20, lineHeight: 22},
  stepRow: {flexDirection: 'row', gap: 6, alignItems: 'center'},
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepDotActive: {backgroundColor: '#E8490F'},
  stepDotCurrent: {width: 24},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 8},
  titleArea: {marginBottom: 16},
  stepLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: '#E8490F',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 30,
    color: Colors.White,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    lineHeight: 22,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(232,73,15,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.18)',
    padding: 14,
    marginBottom: 24,
  },
  noteIcon: {fontSize: 18},
  noteText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 20,
  },
  orange: {color: '#E8490F', fontFamily: FontFamily.UrbanistBold},
  inputGroup: {marginBottom: 18},
  label: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.White,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.White,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginTop: 4,
    gap: 10,
  },
  locationLeft: {flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1},
  locationIcon: {fontSize: 20},
  locationTitle: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.White,
    marginBottom: 2,
  },
  locationSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  locationSubtitleError: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: '#EA4335',
  },
  retryLink: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: '#E8490F',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
    backgroundColor: Colors.bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
