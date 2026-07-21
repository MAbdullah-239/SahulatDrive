import React, {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {logout} from '../../../redux/slices/authSlice';
import {setVerified} from '../../../redux/slices/providerSlice';
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  logoutUser,
} from '../../../requestHandler/api';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
  Switch,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  User,
  Phone,
  Car,
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  ShieldAlert,
  Star,
  Globe,
  Bell,
  ChevronRight,
  LogOut,
  X,
  Check,
  Calendar,
} from 'lucide-react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
}

const SETTINGS = [
  {
    id: 'payments',
    label: 'Payment History',
    Icon: CreditCard,
    chevron: true,
    badge: null,
  },
  {
    id: 'sos',
    label: 'SOS Emergency Contacts',
    Icon: ShieldAlert,
    chevron: false,
    badge: 'Active',
  },
  {
    id: 'reviews',
    label: 'My Ratings & Reviews',
    Icon: Star,
    chevron: true,
    badge: null,
  },
];

export const Profile: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user);
  const [name, setName] = useState(authUser?.name ?? '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [year, setYear] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setVehiclesLoading(true);
      getVehicles()
        .then(({data}: any) => {
          if (!cancelled) setVehicles(data.vehicles ?? []);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setVehiclesLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const openAdd = () => {
    setEditingVehicle(null);
    setMake('');
    setModel('');
    setRegistrationNumber('');
    setYear('');
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setMake(v.make);
    setModel(v.model);
    setRegistrationNumber(v.registration_number);
    setYear(String(v.year));
    setModalOpen(true);
  };

  const saveVehicle = async () => {
    if (!make.trim() || !model.trim() || !registrationNumber.trim() || !year.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    const payload = {
      make,
      model,
      year: Number(year),
      registration_number: registrationNumber,
    };

    setSavingVehicle(true);
    try {
      if (editingVehicle) {
        const {data}: any = await updateVehicle(editingVehicle.id, payload);
        setVehicles(prev =>
          prev.map(v => (v.id === editingVehicle.id ? data.vehicle : v)),
        );
      } else {
        const {data}: any = await addVehicle(payload);
        setVehicles(prev => [...prev, data.vehicle]);
      }
      setModalOpen(false);
    } catch (error) {
      Alert.alert('Something went wrong', 'Could not save this vehicle. Please try again.');
    } finally {
      setSavingVehicle(false);
    }
  };

  // No DELETE /vehicles/:id route exists on the backend yet — this only
  // removes the vehicle from local state, it does not persist server-side.
  const deleteVehicle = (id: string) =>
    Alert.alert('Remove Vehicle', 'Delete this vehicle from your profile?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setVehicles(prev => prev.filter(v => v.id !== id)),
      },
    ]);

  const handleLogout = () =>
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of Sahulat Drive?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
            } catch (error) {
              // Cookie may already be expired server-side — proceed with
              // local sign-out regardless, nothing the user can do about it.
            }
            // Clears any stale provider.isVerified left in memory from a
            // previous provider session on this device, so it can't leak
            // into whichever account logs in next.
            dispatch(logout());
            dispatch(setVerified(false));
            navigation.reset({index: 0, routes: [{name: 'AuthStack'}]});
          },
        },
      ],
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarInner}>
              <User size={42} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          {isEditingProfile ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.profileInput}
              autoFocus
              placeholder="Enter name"
              placeholderTextColor={Colors.GreyText}
            />
          ) : (
            <Text style={styles.profileName}>{name}</Text>
          )}{' '}
          <View style={styles.phoneRow}>
            <Phone size={13} color={Colors.GreyText} strokeWidth={1.8} />
            <Text style={styles.phoneText}>{authUser?.phone ?? '—'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            activeOpacity={0.7}
            onPress={() => setIsEditingProfile(true)}>
            {' '}
            <Pencil size={13} color={Colors.White} strokeWidth={2} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Saved Vehicles ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Saved Vehicles</Text>
          <TouchableOpacity
            onPress={openAdd}
            style={styles.addBtn}
            activeOpacity={0.7}>
            <Plus size={15} color="#E8490F" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {vehiclesLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#E8490F" />
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Car size={28} color={Colors.GreyText} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No vehicles saved yet</Text>
          </View>
        ) : (
          vehicles.map(v => (
            <View key={v.id} style={styles.vehicleCard}>
              <View style={styles.vehicleCardTop}>
                <View style={styles.vehicleIconBox}>
                  <Car size={22} color="#E8490F" strokeWidth={2} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleModel}>
                    {v.make} {v.model}
                  </Text>
                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehiclePlate}>
                      {v.registration_number}
                    </Text>
                    <View style={styles.vehicleMetaDot} />
                    <Calendar
                      size={11}
                      color={Colors.GreyText}
                      strokeWidth={1.8}
                    />
                    <Text style={styles.vehicleYear}>{v.year}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.vehicleActions}>
                <TouchableOpacity
                  style={styles.vehicleEditBtn}
                  onPress={() => openEdit(v)}
                  activeOpacity={0.7}>
                  <Pencil size={14} color={Colors.White} strokeWidth={2} />
                  <Text style={styles.vehicleEditBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.vehicleDeleteBtn}
                  onPress={() => deleteVehicle(v.id)}
                  activeOpacity={0.7}>
                  <Trash2 size={14} color="#EA4335" strokeWidth={2} />
                  <Text style={styles.vehicleDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ── App Settings ── */}
        <Text style={styles.sectionTitleStandalone}>App Settings</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map(({id, label, Icon, chevron, badge}, i) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.settingRow,
                i === SETTINGS.length - 1 && styles.noBorder,
              ]}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrap}>
                  <Icon size={17} color="#E8490F" strokeWidth={1.8} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
              </View>
              {badge ? (
                <View style={styles.activeBadge}>
                  <Check size={10} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.activeBadgeText}>{badge}</Text>
                </View>
              ) : chevron ? (
                <ChevronRight
                  size={18}
                  color={Colors.GreyText}
                  strokeWidth={1.8}
                />
              ) : null}
            </TouchableOpacity>
          ))}

          {/* Language */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Globe size={17} color="#E8490F" strokeWidth={1.8} />
              </View>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.langToggle}>
              {(['EN', 'UR'] as const).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langBtn,
                    language === lang && styles.langBtnActive,
                  ]}
                  onPress={() => setLanguage(lang)}>
                  <Text
                    style={[
                      styles.langBtnText,
                      language === lang && styles.langBtnTextActive,
                    ]}>
                    {lang === 'EN' ? 'English' : 'اردو'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.settingRow, styles.noBorder]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Bell size={17} color="#E8490F" strokeWidth={1.8} />
              </View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{false: '#2C2C2E', true: '#E8490F'}}
              thumbColor={notifications ? '#FFFFFF' : '#8E8E93'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}>
          <LogOut size={18} color="#EA4335" strokeWidth={2} />
          <Text style={styles.logoutBtnText}>Log Out Account</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Sahulat Drive v1.0.0</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Add/Edit Vehicle Modal ── */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}>
        <View style={ms.backdrop}>
          <TouchableOpacity
            style={ms.flex}
            activeOpacity={1}
            onPress={() => setModalOpen(false)}
          />
          <View style={ms.sheet}>
            <View style={ms.indicator} />
            <View style={ms.headerRow}>
              <Text style={ms.title}>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalOpen(false)}
                style={ms.closeBtn}>
                <X size={18} color={Colors.GreyText} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {[
              {
                label: 'Make',
                placeholder: 'e.g. Toyota',
                value: make,
                setter: setMake,
                caps: 'sentences' as const,
              },
              {
                label: 'Model',
                placeholder: 'e.g. Corolla',
                value: model,
                setter: setModel,
                caps: 'sentences' as const,
              },
              {
                label: 'License Plate',
                placeholder: 'e.g. LHR-4521',
                value: registrationNumber,
                setter: setRegistrationNumber,
                caps: 'characters' as const,
              },
              {
                label: 'Year',
                placeholder: 'e.g. 2019',
                value: year,
                setter: setYear,
                caps: 'none' as const,
              },
            ].map(f => (
              <View key={f.label} style={ms.inputWrap}>
                <Text style={ms.inputLabel}>{f.label}</Text>
                <TextInput
                  style={ms.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.Grey}
                  value={f.value}
                  onChangeText={f.setter}
                  autoCapitalize={f.caps}
                  keyboardType={f.label === 'Year' ? 'numeric' : 'default'}
                  maxLength={f.label === 'Year' ? 4 : undefined}
                  selectionColor="#E8490F"
                />
              </View>
            ))}

            <View style={ms.btnRow}>
              <TouchableOpacity
                style={ms.cancelBtn}
                onPress={() => setModalOpen(false)}
                activeOpacity={0.7}>
                <Text style={ms.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ms.saveBtn, savingVehicle && ms.saveBtnDisabled]}
                onPress={saveVehicle}
                activeOpacity={0.85}
                disabled={savingVehicle}>
                {savingVehicle ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={ms.saveBtnText}>Save Vehicle</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bgColor},
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 52 : 24,
  },
  profileHeader: {alignItems: 'center', marginBottom: 32},
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(232,73,15,0.06)',
  },
  avatarInner: {
    width: 84,
    height: 84,
    borderRadius: 27,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 3.5,
    borderColor: Colors.bgColor,
  },
  profileName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 24,
    color: Colors.White,
    marginBottom: 6,
  },
  profileInput: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(24),
    color: Colors.White,
    textAlign: 'center',
    borderBottomWidth: WIDTH_BASE_RATIO(1),
    borderBottomColor: '#E8490F',
    minWidth: WIDTH_BASE_RATIO(160),
    marginBottom: HEIGHT_BASE_RATIO(6),
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  phoneText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.GreyText,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  editProfileBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: Colors.White,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.18)',
  },
  addBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: '#E8490F',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  emptyText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  vehicleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 12,
  },
  vehicleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  vehicleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {flex: 1},
  vehicleModel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 5,
  },
  vehicleMeta: {flexDirection: 'row', alignItems: 'center', gap: 6},
  vehiclePlate: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: '#E8490F',
    letterSpacing: 0.5,
  },
  vehicleMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  vehicleYear: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 12,
  },
  vehicleEditBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  vehicleEditBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: Colors.White,
  },
  vehicleDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(234,67,53,0.08)',
  },
  vehicleDeleteBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#EA4335',
  },
  sectionTitleStandalone: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
    marginBottom: 14,
    marginTop: 12,
  },
  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  noBorder: {borderBottomWidth: 0},
  settingLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 15,
    color: Colors.White,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },
  activeBadgeText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 11,
    color: '#10B981',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 3,
  },
  langBtn: {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8},
  langBtnActive: {backgroundColor: '#E8490F'},
  langBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: Colors.GreyText,
  },
  langBtnTextActive: {color: Colors.White, fontFamily: FontFamily.UrbanistBold},
  logoutBtn: {
    flexDirection: 'row',
    height: 54,
    backgroundColor: 'rgba(234,67,53,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234,67,53,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  logoutBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#EA4335',
  },
  versionText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.Grey,
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomSpacer: {height: 100},
  editActionBtn: {},
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 20,
    color: Colors.White,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrap: {marginBottom: 16},
  inputLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 50,
    paddingHorizontal: 16,
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 15,
    color: Colors.White,
  },
  btnRow: {flexDirection: 'row', gap: 10, marginTop: 8},
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.White,
  },
  saveBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E8490F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    shadowColor: '#E8490F',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
