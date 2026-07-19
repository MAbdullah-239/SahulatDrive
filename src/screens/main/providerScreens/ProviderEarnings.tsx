import React from 'react';
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
import {TrendingUp, ArrowUpRight, Wallet, Star} from 'lucide-react-native';

const WEEKLY_DATA = [40, 70, 55, 90, 65, 80, 100]; // relative heights %
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ProviderEarnings: React.FC = () => {
  const maxVal = Math.max(...WEEKLY_DATA);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>This Week</Text>
          </View>
        </View>

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Total Earned</Text>
              <Text style={styles.balanceAmount}>PKR 14,700</Text>
              <View style={styles.growthRow}>
                <ArrowUpRight size={14} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.growthText}>+18% vs last week</Text>
              </View>
            </View>
            <View style={styles.balanceIcon}>
              <Wallet size={28} color="#E8490F" strokeWidth={1.8} />
            </View>
          </View>

          {/* Mini stats */}
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatVal}>12</Text>
              <Text style={styles.balanceStatLabel}>Jobs Done</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatVal}>PKR 1,225</Text>
              <Text style={styles.balanceStatLabel}>Avg per Job</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.balanceStatVal}>4.8</Text>
              </View>
              <Text style={styles.balanceStatLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* ── Weekly Bar Chart ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Overview</Text>
            <TrendingUp size={18} color="#E8490F" strokeWidth={2} />
          </View>
          <View style={styles.barsRow}>
            {WEEKLY_DATA.map((val, idx) => {
              const isToday = idx === 5; // Saturday
              const heightPct = (val / maxVal) * 100;
              return (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%` as any,
                          backgroundColor: isToday ? '#E8490F' : 'rgba(232,73,15,0.35)',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && styles.barDayActive]}>
                    {DAYS[idx]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── By Category ── */}
        <Text style={styles.sectionTitle}>Earnings by Service</Text>
        {[
          {category: 'towing', label: 'Towing', amount: 'PKR 7,500', pct: 51, color: '#E8490F'},
          {category: 'battery_jump', label: 'Battery Jump', amount: 'PKR 4,000', pct: 27, color: '#F59E0B'},
          {category: 'fuel_delivery', label: 'Fuel Delivery', amount: 'PKR 2,100', pct: 14, color: '#10B981'},
          {category: 'tire_change', label: 'Tyre Change', amount: 'PKR 1,100', pct: 8, color: '#3B82F6'},
        ].map(item => (
          <View key={item.category} style={styles.catRow}>
            <View style={[styles.catDot, {backgroundColor: item.color}]} />
            <View style={styles.catInfo}>
              <View style={styles.catTopRow}>
                <Text style={styles.catLabel}>{item.label}</Text>
                <Text style={styles.catAmount}>{item.amount}</Text>
              </View>
              <View style={styles.catBarBg}>
                <View
                  style={[
                    styles.catBarFill,
                    {width: `${item.pct}%` as any, backgroundColor: item.color},
                  ]}
                />
              </View>
            </View>
          </View>
        ))}

        {/* ── Withdrawal ── */}
        <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85}>
          <Text style={styles.withdrawBtnText}>Request Withdrawal</Text>
        </TouchableOpacity>

        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderEarnings;

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
    marginBottom: 18,
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: Colors.White,
  },
  periodBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  periodText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
  },
  balanceCard: {
    backgroundColor: 'rgba(232,73,15,0.07)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(232,73,15,0.2)',
    padding: 20,
    marginBottom: 18,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  balanceLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
    marginBottom: 6,
  },
  balanceAmount: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 30,
    color: Colors.White,
    marginBottom: 6,
  },
  growthRow: {flexDirection: 'row', alignItems: 'center', gap: 3},
  growthText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
    color: '#10B981',
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(232,73,15,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,73,15,0.15)',
    alignItems: 'center',
  },
  balanceStat: {flex: 1, alignItems: 'center'},
  balanceStatDivider: {width: 1, height: 28, backgroundColor: 'rgba(232,73,15,0.15)'},
  balanceStatVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 3,
  },
  balanceStatLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    marginBottom: 22,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  chartTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 6,
  },
  barCol: {alignItems: 'center', flex: 1, height: '100%'},
  barWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  barFill: {width: '100%', borderRadius: 6},
  barDay: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 10,
    color: Colors.GreyText,
    marginTop: 6,
  },
  barDayActive: {color: '#E8490F', fontFamily: FontFamily.UrbanistBold},
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
    marginBottom: 14,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  catDot: {width: 10, height: 10, borderRadius: 5},
  catInfo: {flex: 1},
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.White,
  },
  catAmount: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: Colors.White,
  },
  catBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {height: '100%', borderRadius: 3},
  withdrawBtn: {
    marginTop: 10,
    width: '100%',
    height: 54,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 5},
    elevation: 7,
  },
  withdrawBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
