import React, {useState} from 'react';
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
import {registerTowTruck} from '../../../requestHandler/api';

const TRUCK_TYPES = [
  {id: 'tow_truck', label: 'Tow Truck', icon: '🚛'},
  {id: 'pickup', label: ' Pickup Truck', icon: '🚜'},
];

const CAPACITY_OPTIONS = [
  '1 ton',
  '2 ton',
  '3 ton',
  '5 ton',
  '8 ton',
  '10+ ton',
];

const ProviderAddTowTruck: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const {categories = [], needsWorkshop = false} = route.params || {};

  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [selectedTruckType, setSelectedTruckType] = useState('tow_truck');
  const [selectedCapacity, setSelectedCapacity] = useState('3 ton');
  const [submitting, setSubmitting] = useState(false);

  const isComplete =
    plateNumber.trim().length > 0 &&
    make.trim().length > 0 &&
    model.trim().length > 0 &&
    year.trim().length === 4;

  const handleContinue = async () => {
    // Capacity is picked from labels like "5 ton" / "10+ ton" — pull the
    // leading number out and send it as the plain tons figure the API expects.
    const capacityTons = parseFloat(selectedCapacity) || 3;

    setSubmitting(true);
    try {
      await registerTowTruck({
        vehicle_type: selectedTruckType,
        make,
        model,
        plate_number: plateNumber,
        capacity_tons: capacityTons,
      });

      if (needsWorkshop) {
        navigation.navigate(AuthStack.nestedScreens.ProviderAddWorkshop.name, {
          categories,
        });
      } else {
        navigation.navigate(
          AuthStack.nestedScreens.ProviderUploadDocuments.name,
          {categories},
        );
      }
    } catch (err: any) {
      console.error('[ProviderAddTowTruck]', err?.response?.data ?? err);
      const backendMessage =
        err?.response?.data?.error ?? err?.response?.data?.message;
      Alert.alert(
        'Something went wrong',
        backendMessage ??
          'Could not register your tow truck. Please check your connection and try again.',
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
          <Text style={styles.stepLabel}>Step 2 of 3 — Towing Only</Text>
          <Text style={styles.title}>Register Your{'\n'}Tow Truck</Text>
          <Text style={styles.subtitle}>
            Since you offer towing, you need to register your tow truck. This
            information will be shown to customers during matching.
          </Text>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteIcon}>🚛</Text>
          <Text style={styles.noteText}>
            Only providers offering <Text style={styles.orange}>towing</Text>{' '}
            need to register a vehicle. Mechanics, fuel drivers, and locksmiths
            do not need a vehicle record.
          </Text>
        </View>

        {/* ── Truck Type Selector ── */}
        <Text style={styles.sectionTitle}>Truck Type</Text>
        <View style={styles.truckTypeRow}>
          {TRUCK_TYPES.map(t => {
            const isSelected = selectedTruckType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.truckTypeCard,
                  isSelected && styles.truckTypeCardActive,
                ]}
                onPress={() => setSelectedTruckType(t.id)}
                activeOpacity={0.8}>
                <Text style={styles.truckTypeIcon}>{t.icon}</Text>
                <Text
                  style={[
                    styles.truckTypeLabel,
                    isSelected && styles.truckTypeLabelActive,
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Plate Number ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Plate Number</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.platePrefix}>🚛</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. LHR-4521"
              placeholderTextColor={Colors.Grey}
              selectionColor="#E8490F"
              autoCapitalize="characters"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />
          </View>
        </View>

        {/* ── Make & Model ── */}
        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, {flex: 1}]}>
            <Text style={styles.label}>Make</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Hino"
                placeholderTextColor={Colors.Grey}
                selectionColor="#E8490F"
                value={make}
                onChangeText={setMake}
              />
            </View>
          </View>
          <View style={[styles.inputGroup, {flex: 1}]}>
            <Text style={styles.label}>Model</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Dutro"
                placeholderTextColor={Colors.Grey}
                selectionColor="#E8490F"
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>
        </View>

        {/* ── Year ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2020"
              placeholderTextColor={Colors.Grey}
              keyboardType="number-pad"
              maxLength={4}
              selectionColor="#E8490F"
              value={year}
              onChangeText={setYear}
            />
          </View>
        </View>

        {/* ── Capacity ── */}
        <Text style={styles.sectionTitle}>Towing Capacity</Text>
        <View style={styles.capacityRow}>
          {CAPACITY_OPTIONS.map(cap => {
            const isSelected = selectedCapacity === cap;
            return (
              <TouchableOpacity
                key={cap}
                style={[
                  styles.capacityBadge,
                  isSelected && styles.capacityBadgeActive,
                ]}
                onPress={() => setSelectedCapacity(cap)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.capacityText,
                    isSelected && styles.capacityTextActive,
                  ]}>
                  {cap}
                </Text>
              </TouchableOpacity>
            );
          })}
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
            <Text style={styles.primaryBtnText}>
              {needsWorkshop ? 'Next → Set Up Workshop' : 'Next → Upload Documents'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderAddTowTruck;

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
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 12,
    marginTop: 4,
  },
  truckTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  truckTypeCard: {
    flex: 1,
    minWidth: '45%',
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  truckTypeCardActive: {
    borderColor: '#E8490F',
    backgroundColor: 'rgba(232,73,15,0.08)',
  },
  truckTypeIcon: {fontSize: 22},
  truckTypeLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: Colors.GreyText,
  },
  truckTypeLabelActive: {color: '#E8490F'},
  inputGroup: {marginBottom: 18},
  rowGroup: {flexDirection: 'row', gap: 12, marginBottom: 0},
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
  platePrefix: {fontSize: 18},
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.White,
  },
  capacityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  capacityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  capacityBadgeActive: {
    backgroundColor: '#E8490F',
    borderColor: '#E8490F',
  },
  capacityText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: Colors.GreyText,
  },
  capacityTextActive: {color: Colors.White},
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
