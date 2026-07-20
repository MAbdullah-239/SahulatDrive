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
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {setProviderType} from '../../../requestHandler/api';

// Service categories as defined in backend document
const SERVICE_CATEGORIES = [
  {
    id: 'towing',
    name: 'towing' as const,
    label: 'Towing',
    icon: '🚛',
    description: 'Move broken-down vehicles to workshops or safe locations.',
    requiresTruck: true,
    color: '#E8490F',
    bg: 'rgba(232,73,15,0.1)',
  },
  {
    id: 'mechanic',
    name: 'mechanic',
    label: 'Workshop / Mechanic',
    icon: '🔧',
    description: 'Provide on-site repairs or workshop maintenance services.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
];

type ParamList = {
  ProviderSelectServices: {role: string};
  ProviderUploadDocuments: {categories: string[]};
  ProviderAddTowTruck: {categories: string[]};
};

const ProviderSelectServices: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  };

  const needsTowTruck = selected.includes('towing');
  const canContinue = selected.length > 0 && !submitting;

  const handleContinue = async () => {
    // Towing requires a two-person driver setup, so it takes priority over
    // a plain workshop type when both are selected.
    const providerType = needsTowTruck ? 'two_driver' : 'workshop';

    setSubmitting(true);
    try {
      await setProviderType({provider_type: providerType});

      if (needsTowTruck) {
        navigation.navigate(AuthStack.nestedScreens.ProviderAddTowTruck.name, {
          categories: selected,
        });
      } else {
        navigation.navigate(
          AuthStack.nestedScreens.ProviderUploadDocuments.name,
          {categories: selected},
        );
      }
    } catch (err: any) {
      console.error('[ProviderSelectServices]', err?.response?.data ?? err);
      const backendMessage =
        err?.response?.data?.error ?? err?.response?.data?.message;
      Alert.alert(
        'Something went wrong',
        backendMessage ??
          'Could not save your service selection. Please check your connection and try again.',
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

        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={[styles.stepDot, s === 1 && styles.stepDotActive]}
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
          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <Text style={styles.title}>What services do{'\n'}you offer?</Text>
          <Text style={styles.subtitle}>
            Select all the services you can provide. You can update these later
            from your profile.
          </Text>
        </View>

        {/* Rule from backend: at least one required */}
        {selected.length === 0 && (
          <View style={styles.ruleBox}>
            <Text style={styles.ruleText}>
              ⚡ Select at least one service to continue
            </Text>
          </View>
        )}

        {/* ── Service Category Cards ── */}
        <View style={styles.categoriesList}>
          {SERVICE_CATEGORIES.map(cat => {
            const isSelected = selected.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isSelected && {
                    borderColor: cat.color,
                    backgroundColor: cat.bg,
                  },
                ]}
                onPress={() => toggle(cat.id)}
                activeOpacity={0.8}>
                {/* Left: icon */}
                <View style={[styles.iconWrap, {backgroundColor: cat.bg}]}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>

                {/* Mid: text */}
                <View style={styles.catText}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    {cat.requiresTruck && (
                      <View style={styles.truckBadge}>
                        <Text style={styles.truckBadgeText}>
                          Truck required
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.catDescription}>{cat.description}</Text>
                </View>

                {/* Right: checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    isSelected && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tow truck note */}
        {needsTowTruck && (
          <View style={styles.truckNote}>
            <Text style={styles.truckNoteIcon}>🚛</Text>
            <Text style={styles.truckNoteText}>
              Since you selected <Text style={styles.orange}>Towing</Text>,
              you'll be asked to register your tow truck details in the next
              step.
            </Text>
          </View>
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomContainer}>
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            {selected.length === 0
              ? 'No services selected'
              : `${selected.length} service${
                  selected.length > 1 ? 's' : ''
                } selected`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}>
          {submitting ? (
            <ActivityIndicator color={Colors.White} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {needsTowTruck
                ? 'Next → Add Tow Truck'
                : 'Next → Upload Documents'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderSelectServices;

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
  stepDotActive: {
    width: 24,
    backgroundColor: '#E8490F',
  },
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 8},
  titleArea: {marginBottom: 20},
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
  ruleBox: {
    backgroundColor: 'rgba(232,73,15,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  ruleText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: '#E8490F',
  },
  categoriesList: {gap: 12, marginBottom: 16},
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {fontSize: 26},
  catText: {flex: 1},
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  catLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  truckBadge: {
    backgroundColor: 'rgba(232,73,15,0.15)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  truckBadgeText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 10,
    color: '#E8490F',
  },
  catDescription: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {color: '#FFFFFF', fontSize: 13, fontWeight: 'bold'},
  truckNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(232,73,15,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.18)',
    padding: 14,
    marginTop: 4,
  },
  truckNoteIcon: {fontSize: 18},
  truckNoteText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 20,
  },
  orange: {color: '#E8490F', fontFamily: FontFamily.UrbanistBold},
  /* ── Bottom ── */
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
    backgroundColor: Colors.bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  selectionSummary: {alignItems: 'center'},
  summaryText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
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
    backgroundColor: 'rgba(232,73,15,0.35)',
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
