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
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';

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
    id: 'battery_jump',
    name: 'battery_jump' as const,
    label: 'Battery Jump',
    icon: '🔋',
    description: 'Jump-start dead batteries or replace them on-site.',
    requiresTruck: false,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    id: 'fuel_delivery',
    name: 'fuel_delivery' as const,
    label: 'Fuel Delivery',
    icon: '⛽',
    description: 'Deliver fuel to customers who have run out on the road.',
    requiresTruck: false,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    id: 'tire_change',
    name: 'tire_change' as const,
    label: 'Tyre Change',
    icon: '⚙️',
    description: 'Change flat tyres and fit spare wheels on-site.',
    requiresTruck: false,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    id: 'locksmith',
    name: 'locksmith' as const,
    label: 'Locksmith',
    icon: '🔑',
    description: 'Unlock vehicles for customers locked out of their cars.',
    requiresTruck: false,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
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

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  };

  const needsTowTruck = selected.includes('towing');
  const canContinue = selected.length > 0;

  const handleContinue = () => {
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
                        <Text style={styles.truckBadgeText}>Truck required</Text>
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
              Since you selected <Text style={styles.orange}>Towing</Text>, you'll be asked to register
              your tow truck details in the next step.
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
              : `${selected.length} service${selected.length > 1 ? 's' : ''} selected`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>
            {needsTowTruck ? 'Next → Add Tow Truck' : 'Next → Upload Documents'}
          </Text>
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
