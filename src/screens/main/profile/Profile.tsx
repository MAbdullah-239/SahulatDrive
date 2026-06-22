import React, { useState } from 'react';
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
  Image,
  Switch,
} from 'react-native';
import { Colors } from '../../../generalStyles/colors';
import { FontFamily } from '../../../generalStyles/generalFonts';

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: string;
  emoji: string;
}

const initialVehicles: Vehicle[] = [
  { id: 'v1', model: 'Toyota Corolla', plate: 'LHR-4521', year: '2019', emoji: '🚙' },
  { id: 'v2', model: 'Honda Civic', plate: 'MN-8899', year: '2021', emoji: '🚗' },
];

export const Profile: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form fields for adding/editing vehicles
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');

  // Settings toggles
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');

  const openAddModal = () => {
    setEditingVehicle(null);
    setModel('');
    setPlate('');
    setYear('');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setModel(vehicle.model);
    setPlate(vehicle.plate);
    setYear(vehicle.year);
    setIsModalOpen(true);
  };

  const saveVehicle = () => {
    if (!model.trim() || !plate.trim() || !year.trim()) {
      Alert.alert('Missing Info', 'Please fill in all vehicle details.');
      return;
    }

    if (editingVehicle) {
      // Edit
      setVehicles(prev =>
        prev.map(v =>
          v.id === editingVehicle.id
            ? { ...v, model, plate, year }
            : v
        )
      );
    } else {
      // Add
      const newVehicle: Vehicle = {
        id: `v_${Date.now()}`,
        model,
        plate,
        year,
        emoji: model.toLowerCase().includes('truck') || model.toLowerCase().includes('suv') ? '🚙' : '🚗',
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    setIsModalOpen(false);
  };

  const deleteVehicle = (id: string) => {
    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to delete this vehicle from your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVehicles(prev => prev.filter(v => v.id !== id));
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out of Sahulat Drive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── Profile Header Section ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmoji}>👱‍♂️</Text>
            </View>
            <View style={styles.onlineStatus} />
          </View>
          <Text style={styles.profileName}>Ahmed Raza</Text>
          <Text style={styles.profilePhone}>+92 300 1234567</Text>
          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.7}>
            <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Saved Vehicles Section ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Saved Vehicles</Text>
          <TouchableOpacity onPress={openAddModal} activeOpacity={0.7} style={styles.addVehicleLink}>
            <Text style={styles.addVehicleText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehiclesList}>
          {vehicles.length === 0 ? (
            <View style={styles.noVehiclesCard}>
              <Text style={styles.noVehiclesText}>No vehicles saved yet.</Text>
            </View>
          ) : (
            vehicles.map(vehicle => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleInfoRow}>
                  <View style={styles.vehicleEmojiBox}>
                    <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                  </View>
                  <View style={styles.vehicleTextWrapper}>
                    <Text style={styles.vehicleModel}>{vehicle.model}</Text>
                    <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                    <Text style={styles.vehicleYear}>Year: {vehicle.year}</Text>
                  </View>
                </View>

                {/* Edit & Delete Action Buttons */}
                <View style={styles.vehicleActionsRow}>
                  <TouchableOpacity
                    style={[styles.vehicleActionBtn, styles.editActionBtn]}
                    onPress={() => openEditModal(vehicle)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.vehicleActionBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.vehicleActionBtn, styles.deleteActionBtn]}
                    onPress={() => deleteVehicle(vehicle.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.vehicleActionBtnText, styles.deleteActionBtnText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── Settings Section ── */}
        <Text style={styles.sectionTitleHeader}>App Settings</Text>
        <View style={styles.settingsCard}>
          {/* Payment History */}
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💳</Text>
              <Text style={styles.settingLabel}>Payment History</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Saved Emergency Contacts */}
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📞</Text>
              <Text style={styles.settingLabel}>SOS Emergency Contacts</Text>
            </View>
            <View style={styles.settingRightBadge}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </TouchableOpacity>

          {/* Ratings & Reviews */}
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⭐</Text>
              <Text style={styles.settingLabel}>My Ratings & Reviews</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Language Toggle */}
          <View style={[styles.settingItem, styles.noBorder]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={styles.settingLabel}>Language Settings</Text>
            </View>
            <View style={styles.langSelectorRow}>
              <TouchableOpacity
                style={[styles.langChip, language === 'EN' && styles.langChipActive]}
                onPress={() => setLanguage('EN')}
              >
                <Text style={[styles.langChipText, language === 'EN' && styles.langChipTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langChip, language === 'UR' && styles.langChipActive]}
                onPress={() => setLanguage('UR')}
              >
                <Text style={[styles.langChipText, language === 'UR' && styles.langChipTextActive]}>Urdu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications Switch */}
          <View style={[styles.settingItem, styles.noBorder, { paddingTop: 6 }]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#2C2C2E', true: '#E8490F' }}
              thumbColor={notifications ? '#FFFFFF' : '#8E8E93'}
              ios_backgroundColor="#2C2C2E"
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>
        </View>

        {/* ── Account Section & Logout ── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Log Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.appVersionText}>Sahulat Drive v1.0.0 (Production)</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── ADD/EDIT VEHICLE MODAL ── */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalFlexSpacer} activeOpacity={1} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>
              {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Car Model / Make</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Honda Civic, Toyota Yaris"
                placeholderTextColor={Colors.Grey || '#868686'}
                value={model}
                onChangeText={setModel}
                selectionColor="#E8490F"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>License Number Plate</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. LHR-4521, MN-8899"
                placeholderTextColor={Colors.Grey || '#868686'}
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
                selectionColor="#E8490F"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Manufacturing Year</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2019, 2022"
                placeholderTextColor={Colors.Grey || '#868686'}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
                selectionColor="#E8490F"
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setIsModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={saveVehicle}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveBtnText}>Save Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#030005',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 52 : 24,
  },
  /* Profile Header */
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarBorder: {
    width: 106,
    height: 106,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 54,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 4,
    borderColor: '#030005',
  },
  profileName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 24,
    color: Colors.White || '#FFFFFF',
    marginBottom: 4,
  },
  profilePhone: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 16,
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  editProfileBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
  },
  /* Saved Vehicles */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
  },
  addVehicleLink: {
    paddingVertical: 4,
  },
  addVehicleText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#E8490F',
  },
  vehiclesList: {
    gap: 12,
    marginBottom: 28,
  },
  noVehiclesCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  noVehiclesText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
  },
  vehicleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleTextWrapper: {
    flex: 1,
  },
  vehicleModel: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: Colors.White || '#FFFFFF',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 13,
    color: '#E8490F',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  vehicleYear: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  vehicleActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
  },
  vehicleActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  vehicleActionBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
  },
  deleteActionBtn: {
    backgroundColor: 'rgba(234, 67, 53, 0.08)',
  },
  deleteActionBtnText: {
    color: '#EA4335',
  },
  /* Settings List */
  sectionTitleHeader: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 28,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
  },
  settingArrow: {
    fontSize: 22,
    color: Colors.Grey || '#868686',
    fontWeight: '300',
  },
  settingRightBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    color: '#10B981',
    fontSize: 11,
  },
  langSelectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 2,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langChipActive: {
    backgroundColor: '#E8490F',
  },
  langChipText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    color: Colors.GreyText || '#A7A7A7',
    fontSize: 12,
  },
  langChipTextActive: {
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistBold || 'System',
  },
  /* Logout */
  logoutButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: 'rgba(234, 67, 53, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutButtonText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: '#EA4335',
  },
  appVersionText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.Grey || '#868686',
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  /* Modal styling */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 0, 5, 0.75)',
    justifyContent: 'flex-end',
  },
  modalFlexSpacer: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#0F1013',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalIndicator: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 20,
    color: Colors.White || '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    height: 48,
    paddingHorizontal: 16,
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCancelBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
  },
  modalSaveBtn: {
    backgroundColor: '#E8490F',
  },
  modalSaveBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
