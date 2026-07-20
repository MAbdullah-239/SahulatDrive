import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  LayoutAnimation,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  CheckCircle,
  X,
  Truck,
  Battery,
  Fuel,
  Wrench,
  Lock,
  ChevronRight,
  Clock,
  MapPin,
  Star,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProviderStackParamList} from '../../../navigation/providerStackNavigation';
import {getProviderJobs} from '../../../requestHandler/api';

const JOB_ICON_MAP: Record<string, any> = {
  towing: Truck,
  battery_jump: Battery,
  fuel_delivery: Fuel,
  tire_change: Wrench,
  locksmith: Lock,
};

const JOB_COLOR_MAP: Record<string, string> = {
  towing: '#E8490F',
  battery_jump: '#F59E0B',
  fuel_delivery: '#10B981',
  tire_change: '#3B82F6',
  locksmith: '#8B5CF6',
};

const mockJobs = [
  {
    id: 'j1',
    category: 'battery_jump',
    customer: 'Ahmed Raza',
    customerRating: 4.6,
    date: '18 July 2026',
    time: '2:30 PM',
    location: 'Canal Road, Lahore',
    amount: 'PKR 800',
    status: 'Completed',
  },
  {
    id: 'j2',
    category: 'towing',
    customer: 'Sara Khan',
    customerRating: 4.2,
    date: '17 July 2026',
    time: '11:00 AM',
    location: 'Model Town, Lahore',
    amount: 'PKR 2,500',
    status: 'Completed',
  },
  {
    id: 'j3',
    category: 'fuel_delivery',
    customer: 'Bilal Ahmed',
    customerRating: 4.8,
    date: '16 July 2026',
    time: '9:15 AM',
    location: 'Johar Town, Lahore',
    amount: 'PKR 400',
    status: 'Cancelled',
  },
  {
    id: 'j4',
    category: 'tire_change',
    customer: 'Fatima Malik',
    customerRating: 5.0,
    date: '15 July 2026',
    time: '4:45 PM',
    location: 'DHA Phase 5, Lahore',
    amount: 'PKR 600',
    status: 'Completed',
  },
];

const ProviderJobsHistory: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList>>();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const {data} = await getProviderJobs();
        const jobsList = Array.isArray(data) ? data : data.jobs || [];
        if (jobsList.length > 0) {
          const formatted = jobsList.map((job: any) => {
            const statusLabel =
              job.status === 'completed'
                ? 'Completed'
                : job.status === 'cancelled'
                ? 'Cancelled'
                : 'Active';

            const dateObj = job.created_at ? new Date(job.created_at) : new Date();
            const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            return {
              id: job.id,
              category: job.service_category?.name || 'towing',
              customer: job.customer?.name || job.user?.name || 'Customer',
              customerRating: job.customer?.rating || 4.5,
              date: dateStr,
              time: timeStr,
              location: job.address || 'Unknown Location',
              amount: `PKR ${job.final_price || job.service_category?.base_price || 1000}`,
              status: statusLabel,
            };
          });
          setJobs(formatted);
        } else {
          setJobs(mockJobs);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const filtered = jobs.filter(j => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return j.status === 'Completed';
    return j.status === 'Cancelled';
  });

  const totalEarned = jobs
    .filter(j => j.status === 'Completed')
    .reduce((sum, j) => {
      const num = parseInt(j.amount.replace(/\D/g, ''), 10);
      return sum + num;
    }, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <View style={styles.earningsBadge}>
          <Text style={styles.earningsText}>PKR {totalEarned.toLocaleString()}</Text>
          <Text style={styles.earningsLabel}> earned</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['all', 'completed', 'cancelled'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab(tab);
            }}
            activeOpacity={0.7}>
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#E8490F" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {filtered.map(job => {
            const Icon = JOB_ICON_MAP[job.category] || Wrench;
            const color = JOB_COLOR_MAP[job.category] || '#E8490F';
            const done = job.status === 'Completed';

            return (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ProviderActiveJob')}>
                {/* Top row */}
                <View style={styles.jobTopRow}>
                  <View style={styles.jobTypeRow}>
                    <View style={[styles.jobIcon, {backgroundColor: color + '18'}]}>
                      <Icon size={18} color={color} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={styles.jobCategory}>
                        {job.category.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.jobDateTime}>
                        {job.date} · {job.time}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: done ? 'rgba(16,185,129,0.1)' : 'rgba(234,67,53,0.1)',
                        borderColor: done ? 'rgba(16,185,129,0.25)' : 'rgba(234,67,53,0.25)',
                      },
                    ]}>
                    {done ? (
                      <CheckCircle size={11} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <X size={11} color="#EA4335" strokeWidth={2.5} />
                    )}
                    <Text
                      style={[
                        styles.statusText,
                        {color: done ? '#10B981' : '#EA4335'},
                      ]}>
                      {job.status}
                    </Text>
                  </View>
                </View>

                {/* Info rows */}
                <View style={styles.jobInfoRows}>
                  <View style={styles.infoRow}>
                    <MapPin size={13} color={Colors.GreyText} strokeWidth={1.8} />
                    <Text style={styles.infoText}>{job.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                    <Text style={styles.infoText}>
                      {job.customer} · {job.customerRating} rating
                    </Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  <Text style={styles.jobAmount}>{job.amount}</Text>
                  <View style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>Details</Text>
                    <ChevronRight size={14} color="#E8490F" strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No jobs yet</Text>
              <Text style={styles.emptySubtitle}>
                Go online to start receiving job requests
              </Text>
            </View>
          )}

          <View style={{height: 20}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProviderJobsHistory;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.bgColor},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: Colors.White,
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  earningsText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#10B981',
  },
  earningsLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: '#10B981',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 0,
    backgroundColor: Colors.bgColor,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {borderBottomColor: '#E8490F'},
  tabText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.GreyText,
  },
  tabTextActive: {
    fontFamily: FontFamily.UrbanistBold,
    color: Colors.White,
  },
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 16},
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 12,
  },
  jobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTypeRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCategory: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  jobDateTime: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 11,
  },
  jobInfoRows: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
  },
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  infoText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobAmount: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  detailsBtn: {flexDirection: 'row', alignItems: 'center', gap: 2},
  detailsBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#E8490F',
  },
  emptyState: {alignItems: 'center', paddingTop: 60, gap: 10},
  emptyIcon: {fontSize: 48},
  emptyTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
  },
  emptySubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
    textAlign: 'center',
  },
});
