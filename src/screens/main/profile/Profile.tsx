import React, {useState} from 'react';
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
  model: string;
  plate: string;
  year: string;
}

const initialVehicles: Vehicle[] = [
  {id: 'v1', model: 'Toyota Corolla', plate: 'LHR-4521', year: '2019'},
  {id: 'v2', model: 'Honda Civic', plate: 'MN-8899', year: '2021'},
];

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
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');

  const openAdd = () => {
    setEditingVehicle(null);
    setModel('');
    setPlate('');
    setYear('');
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setModel(v.model);
    setPlate(v.plate);
    setYear(v.year);
    setModalOpen(true);
  };

  const saveVehicle = () => {
    if (!model.trim() || !plate.trim() || !year.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (editingVehicle) {
      setVehicles(prev =>
        prev.map(v =>
          v.id === editingVehicle.id ? {...v, model, plate, year} : v,
        ),
      );
    } else {
      setVehicles(prev => [
        ...prev,
        {id: `v_${Date.now()}`, model, plate, year},
      ]);
    }
    setModalOpen(false);
  };

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
        {text: 'Log Out', style: 'destructive', onPress: () => {}},
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
          <Text style={styles.profileName}>Ahmed Raza</Text>
          <View style={styles.phoneRow}>
            <Phone size={13} color={Colors.GreyText} strokeWidth={1.8} />
            <Text style={styles.phoneText}>+92 300 1234567</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.7}>
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

        {vehicles.length === 0 ? (
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
                  <Text style={styles.vehicleModel}>{v.model}</Text>
                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehiclePlate}>{v.plate}</Text>
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
                label: 'Car Model / Make',
                placeholder: 'e.g. Toyota Corolla',
                value: model,
                setter: setModel,
                caps: 'sentences' as const,
              },
              {
                label: 'License Plate',
                placeholder: 'e.g. LHR-4521',
                value: plate,
                setter: setPlate,
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
                style={ms.saveBtn}
                onPress={saveVehicle}
                activeOpacity={0.85}>
                <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={ms.saveBtnText}>Save Vehicle</Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },

  scrollContent: {
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    paddingTop:
      Platform.OS === 'android' ? HEIGHT_BASE_RATIO(52) : HEIGHT_BASE_RATIO(24),
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(32),
  },

  avatarWrap: {
    width: WIDTH_BASE_RATIO(100),
    height: HEIGHT_BASE_RATIO(100),
    borderRadius: WIDTH_BASE_RATIO(32),
    borderWidth: WIDTH_BASE_RATIO(2.5),
    borderColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(16),
    backgroundColor: 'rgba(232,73,15,0.06)',
  },

  avatarInner: {
    width: WIDTH_BASE_RATIO(84),
    height: HEIGHT_BASE_RATIO(84),
    borderRadius: WIDTH_BASE_RATIO(27),
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  onlineBadge: {
    position: 'absolute',
    bottom: HEIGHT_BASE_RATIO(-2),
    right: WIDTH_BASE_RATIO(-2),
    width: WIDTH_BASE_RATIO(22),
    height: HEIGHT_BASE_RATIO(22),
    borderRadius: WIDTH_BASE_RATIO(11),
    backgroundColor: '#10B981',
    borderWidth: WIDTH_BASE_RATIO(3.5),
    borderColor: Colors.bgColor,
  },

  profileName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(24),
    color: Colors.White,
    marginBottom: HEIGHT_BASE_RATIO(6),
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(6),
    marginBottom: HEIGHT_BASE_RATIO(14),
  },

  phoneText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(14),
    color: Colors.GreyText,
  },

  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(7),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(9),
    borderRadius: WIDTH_BASE_RATIO(12),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(255,255,255,0.04)',
  },

  editProfileBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: FONT_SIZE(13),
    color: Colors.White,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(14),
  },

  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(18),
    color: Colors.White,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(5),
    paddingHorizontal: WIDTH_BASE_RATIO(12),
    paddingVertical: HEIGHT_BASE_RATIO(6),
    borderRadius: WIDTH_BASE_RATIO(10),
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(232,73,15,0.18)',
  },

  addBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(13),
    color: '#E8490F',
  },

  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: WIDTH_BASE_RATIO(16),
    padding: WIDTH_BASE_RATIO(24),
    alignItems: 'center',
    columnGap: HEIGHT_BASE_RATIO(10),
    marginBottom: HEIGHT_BASE_RATIO(28),
  },

  emptyText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: FONT_SIZE(14),
    color: Colors.GreyText,
  },

  vehicleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: WIDTH_BASE_RATIO(20),
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(255,255,255,0.04)',
    padding: WIDTH_BASE_RATIO(16),
    marginBottom: HEIGHT_BASE_RATIO(12),
  },

  vehicleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(14),
    marginBottom: HEIGHT_BASE_RATIO(14),
  },

  vehicleIconBox: {
    width: WIDTH_BASE_RATIO(50),
    height: HEIGHT_BASE_RATIO(50),
    borderRadius: WIDTH_BASE_RATIO(16),
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vehicleModel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(16),
    color: Colors.White,
    marginBottom: HEIGHT_BASE_RATIO(5),
  },

  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(6),
  },

  vehiclePlate: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(13),
    color: '#E8490F',
    letterSpacing: 0.5,
  },

  vehicleYear: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: FONT_SIZE(12),
    color: Colors.GreyText,
  },

  vehicleActions: {
    flexDirection: 'row',
    columnGap: WIDTH_BASE_RATIO(10),
    borderTopWidth: WIDTH_BASE_RATIO(1),
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: HEIGHT_BASE_RATIO(12),
  },

  vehicleEditBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(6),
    height: HEIGHT_BASE_RATIO(38),
    borderRadius: WIDTH_BASE_RATIO(10),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  vehicleDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(6),
    height: HEIGHT_BASE_RATIO(38),
    borderRadius: WIDTH_BASE_RATIO(10),
    backgroundColor: 'rgba(234,67,53,0.08)',
  },

  sectionTitleStandalone: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(18),
    color: Colors.White,
    marginBottom: HEIGHT_BASE_RATIO(14),
    marginTop: HEIGHT_BASE_RATIO(12),
  },

  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: WIDTH_BASE_RATIO(22),
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(6),
    marginBottom: HEIGHT_BASE_RATIO(28),
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HEIGHT_BASE_RATIO(14),
    borderBottomWidth: WIDTH_BASE_RATIO(1),
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(12),
  },

  settingIconWrap: {
    width: WIDTH_BASE_RATIO(36),
    height: HEIGHT_BASE_RATIO(36),
    borderRadius: WIDTH_BASE_RATIO(10),
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(15),
    color: Colors.White,
  },

  logoutBtn: {
    flexDirection: 'row',
    height: HEIGHT_BASE_RATIO(54),
    backgroundColor: 'rgba(234,67,53,0.06)',
    borderRadius: WIDTH_BASE_RATIO(16),
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(234,67,53,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(10),
    marginBottom: HEIGHT_BASE_RATIO(18),
  },

  logoutBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(15),
    color: '#EA4335',
  },

  versionText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: FONT_SIZE(12),
    color: Colors.Grey,
    textAlign: 'center',
    marginBottom: HEIGHT_BASE_RATIO(16),
  },

  bottomSpacer: {
    height: HEIGHT_BASE_RATIO(100),
  },
});

const ms = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,0,5,0.78)',
    justifyContent: 'flex-end',
  },

  flex: {
    flex: 1,
  },

  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: WIDTH_BASE_RATIO(28),
    borderTopRightRadius: WIDTH_BASE_RATIO(28),
    paddingTop: HEIGHT_BASE_RATIO(8),
    paddingBottom:
      Platform.OS === 'ios' ? HEIGHT_BASE_RATIO(36) : HEIGHT_BASE_RATIO(28),
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(255,255,255,0.06)',
  },

  indicator: {
    width: WIDTH_BASE_RATIO(40),
    height: HEIGHT_BASE_RATIO(4),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: WIDTH_BASE_RATIO(2),
    alignSelf: 'center',
    marginBottom: HEIGHT_BASE_RATIO(18),
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(22),
  },

  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(20),
    color: Colors.White,
  },

  closeBtn: {
    width: WIDTH_BASE_RATIO(34),
    height: HEIGHT_BASE_RATIO(34),
    borderRadius: WIDTH_BASE_RATIO(10),
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputWrap: {
    marginBottom: HEIGHT_BASE_RATIO(16),
  },

  inputLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(13),
    color: Colors.GreyText,
    marginBottom: HEIGHT_BASE_RATIO(8),
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: WIDTH_BASE_RATIO(14),
    borderWidth: WIDTH_BASE_RATIO(1),
    borderColor: 'rgba(255,255,255,0.05)',
    height: HEIGHT_BASE_RATIO(50),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(15),
    color: Colors.White,
  },

  btnRow: {
    flexDirection: 'row',
    columnGap: WIDTH_BASE_RATIO(10),
    marginTop: HEIGHT_BASE_RATIO(8),
  },

  cancelBtn: {
    flex: 1,
    height: HEIGHT_BASE_RATIO(50),
    borderRadius: WIDTH_BASE_RATIO(14),
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: FONT_SIZE(14),
    color: Colors.White,
  },

  saveBtn: {
    flex: 1.5,
    height: HEIGHT_BASE_RATIO(50),
    borderRadius: WIDTH_BASE_RATIO(14),
    backgroundColor: '#E8490F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(7),
    shadowColor: '#E8490F',
    shadowOpacity: 0.3,
    shadowRadius: WIDTH_BASE_RATIO(12),
    shadowOffset: {width: 0, height: HEIGHT_BASE_RATIO(4)},
    elevation: 5,
  },

  saveBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(14),
    color: '#FFFFFF',
  },
});
