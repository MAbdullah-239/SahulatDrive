import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {logout, setUser} from '../../../redux/slices/authSlice';
import {setVerified} from '../../../redux/slices/providerSlice';
import {getCurrentUser} from '../../../requestHandler/api';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  Star,
  Truck,
  Battery,
  Fuel,
  Wrench,
  ChevronRight,
  Shield,
  FileText,
  LogOut,
  Edit3,
  MapPin,
} from 'lucide-react-native';

const ProviderProfile: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const {towTruck, isVerified} = useAppSelector(state => state.provider);

  // Home and Profile share the same auth/provider Redux state as their single
  // source of truth — this refresh just keeps it current when Profile opens,
  // it isn't a separate copy of the data.
  useEffect(() => {
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
      .catch(() => {
        // Keep showing whatever's already in Redux from cold start.
      });
  }, [dispatch]);

  const services = [
    {name: 'Towing', icon: Truck, color: '#E8490F'},
    {name: 'Battery Jump', icon: Battery, color: '#F59E0B'},
    {name: 'Fuel Delivery', icon: Fuel, color: '#10B981'},
  ];

  const vehicleSubtitle = towTruck
    ? `${towTruck.make} ${towTruck.model} · ${towTruck.plateNumber} · ${towTruck.capacity}`
    : 'Hino Dutro · LHR-9988 · 3 ton';

  const menuItems = [
    {icon: FileText, color: '#3B82F6', label: 'My Documents', subtitle: 'CNIC, License, Business'},
    {icon: Truck, color: '#E8490F', label: 'My Vehicle', subtitle: vehicleSubtitle},
    {
      icon: Shield,
      color: isVerified ? '#10B981' : '#F59E0B',
      label: 'Verification Status',
      subtitle: isVerified ? 'Verified ✓' : 'Pending review',
    },
    {icon: MapPin, color: '#8B5CF6', label: 'Service Areas', subtitle: 'Lahore — Gulberg, DHA, Johar Town'},
  ];

  const nameInitials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HT';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Edit3 size={18} color="#E8490F" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nameInitials}</Text>
            </View>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Shield size={12} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            )}
          </View>

          <Text style={styles.providerName}>{user?.name}</Text>
          <Text style={styles.providerPhone}>{user?.phone}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.statVal}>4.8</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>127</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>98%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>

        {/* ── My Services ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Services</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.manageLink}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesRow}>
          {services.map(svc => {
            const Icon = svc.icon;
            return (
              <View key={svc.name} style={styles.svcChip}>
                <Icon size={14} color={svc.color} strokeWidth={2} />
                <Text style={styles.svcChipText}>{svc.name}</Text>
              </View>
            );
          })}
          <TouchableOpacity style={[styles.svcChip, styles.addSvcChip]} activeOpacity={0.7}>
            <Text style={styles.addSvcText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                activeOpacity={0.7}>
                <View style={[styles.menuIcon, {backgroundColor: item.color + '18'}]}>
                  <Icon size={18} color={item.color} strokeWidth={1.8} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={Colors.GreyText} strokeWidth={1.8} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={() => {
          // Without this, a previously-approved provider's isVerified: true
          // stays in memory after logout and can leak into whichever
          // account logs in next during the same app session.
          dispatch(logout());
          dispatch(setVerified(false));
          navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
        }}>
          <LogOut size={18} color="#EA4335" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderProfile;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingBottom: 30},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 48 : 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: Colors.White,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.2)',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {position: 'relative', marginBottom: 14},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.bgColor,
  },
  providerName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 20,
    color: Colors.White,
    marginBottom: 4,
  },
  providerPhone: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  statItem: {flex: 1, alignItems: 'center'},
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  statDivider: {width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.07)'},
  statVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  manageLink: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#E8490F',
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  svcChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  svcChipText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.White,
  },
  addSvcChip: {
    borderColor: 'rgba(232,73,15,0.3)',
    backgroundColor: 'rgba(232,73,15,0.05)',
  },
  addSvcText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#E8490F',
  },
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 18,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {flex: 1},
  menuLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 3,
  },
  menuSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(234,67,53,0.25)',
    backgroundColor: 'rgba(234,67,53,0.06)',
  },
  logoutText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#EA4335',
  },
});
