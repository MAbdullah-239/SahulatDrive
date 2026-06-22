import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, LayoutAnimation, Modal,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  AlertTriangle, Truck, Building2, Clock, User,
  Star, MapPin, Navigation2, RotateCcw, Zap,
  CheckCircle, X, ChevronRight, CreditCard,
  Lock, Signal, Circle,
} from 'lucide-react-native';

interface PastRequest {
  id: string; type: 'Emergency' | 'Tow' | 'Workshop';
  dateTime: string; name: string; cost: string;
  status: 'Completed' | 'Cancelled'; details: string[];
}

const mockPastRequests: PastRequest[] = [
  {
    id: 'p1', type: 'Emergency',
    dateTime: '22 June 2026, 02:30 PM', name: 'Zahid Khan (Mechanic)',
    cost: 'PKR 1,500', status: 'Completed',
    details: [
      '02:15 PM — Emergency SOS triggered by user',
      '02:18 PM — Mechanic Zahid Khan accepted the request',
      '02:22 PM — Mechanic arrived at Kalma Chowk, Lahore',
      '02:30 PM — Jumpstart completed & payment verified',
    ],
  },
  {
    id: 'p2', type: 'Tow',
    dateTime: '18 June 2026, 11:00 AM', name: 'Lahore Towing Co.',
    cost: 'PKR 4,500', status: 'Completed',
    details: [
      '10:45 AM — Flatbed tow truck requested',
      '10:52 AM — Tow truck assigned (Plate: LHR-9988)',
      '11:15 AM — Vehicle loaded near Model Town',
      '11:40 AM — Vehicle delivered to Auto Experts Workshop',
    ],
  },
  {
    id: 'p3', type: 'Workshop',
    dateTime: '10 June 2026, 04:15 PM', name: 'QuickFix Car Service',
    cost: 'PKR 8,200', status: 'Cancelled',
    details: [
      '03:50 PM — Workshop booking requested',
      '04:10 PM — Booking cancelled due to service unavailability',
    ],
  },
];

const typeConfig = {
  Emergency: {Icon: AlertTriangle, color: '#EA4335', bg: 'rgba(234,67,53,0.1)'},
  Tow:       {Icon: Truck,         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'},
  Workshop:  {Icon: Building2,     color: '#10B981', bg: 'rgba(16,185,129,0.1)'},
};

export const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [requestStatus, setRequestStatus] = useState<'Searching'|'Assigned'|'En Route'|'Completed'>('En Route');
  const [etaSeconds, setEtaSeconds] = useState(720);
  const [selectedRequest, setSelectedRequest] = useState<PastRequest | null>(null);

  useEffect(() => {
    if (requestStatus === 'Completed') return;
    const id = setInterval(() => {
      setEtaSeconds(prev => {
        if (prev <= 1) { clearInterval(id); setRequestStatus('Completed'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [requestStatus]);

  const formatEta = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;

  const advanceStatus = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const map: Record<string, 'Assigned'|'En Route'|'Completed'|'Searching'> = {
      Searching: 'Assigned', Assigned: 'En Route', 'En Route': 'Completed', Completed: 'Searching',
    };
    const next = map[requestStatus];
    setRequestStatus(next);
    if (next === 'Assigned' || next === 'En Route') setEtaSeconds(720);
    if (next === 'Searching') setEtaSeconds(45);
  };

  const stepIndex = {Searching: 0, Assigned: 1, 'En Route': 2, Completed: 3}[requestStatus] ?? 0;
  const steps = ['Search', 'Assign', 'En Route', 'Done'];
  const stepColors = {
    Searching: '#3B82F6', Assigned: '#F59E0B', 'En Route': '#E8490F', Completed: '#10B981',
  };
  const statusColor = stepColors[requestStatus] ?? '#E8490F';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests & History</Text>
      </View>

      {/* Segment tabs */}
      <View style={styles.tabBar}>
        {(['active', 'past'] as const).map(tab => (
          <TouchableOpacity key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setActiveTab(tab); }}
            activeOpacity={0.7}>
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === 'active' ? 'Active Requests' : 'Past Requests'}
            </Text>
            {tab === 'active' && requestStatus !== 'Completed' && (
              <View style={styles.liveIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          <>
            {/* Active request card */}
            <View style={styles.activeCard}>
              {/* Status row */}
              <View style={styles.activeCardHeader}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
                  <Text style={styles.statusLabel}>Status: <Text style={[styles.statusVal, {color: statusColor}]}>{requestStatus}</Text></Text>
                </View>
                {requestStatus !== 'Completed' && (
                  <View style={styles.etaBox}>
                    <Clock size={13} color="#E8490F" strokeWidth={2} />
                    <Text style={styles.etaText}>{formatEta(etaSeconds)}</Text>
                  </View>
                )}
              </View>

              {/* Step progress */}
              <View style={styles.stepper}>
                {steps.map((step, idx) => {
                  const done = idx < stepIndex;
                  const active = idx === stepIndex;
                  return (
                    <View key={step} style={styles.stepWrap}>
                      <View style={styles.stepConnectorRow}>
                        {idx > 0 && (
                          <View style={[styles.connector, {backgroundColor: idx <= stepIndex ? '#E8490F' : 'rgba(255,255,255,0.08)'}]} />
                        )}
                        <View style={[styles.stepNode, done && styles.stepDone, active && {borderColor: statusColor, backgroundColor: '#030005'}]}>
                          {done
                            ? <CheckCircle size={13} color="#FFFFFF" strokeWidth={2.5} />
                            : <Circle size={8} color={active ? statusColor : 'rgba(255,255,255,0.15)'} fill={active ? statusColor : 'transparent'} strokeWidth={2} />
                          }
                        </View>
                      </View>
                      <Text style={[styles.stepLabel, (active || done) && styles.stepLabelActive]}>{step}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Mechanic info */}
              <View style={styles.mechanicBox}>
                {requestStatus === 'Searching' ? (
                  <View style={styles.searchingBox}>
                    <Signal size={24} color="#3B82F6" strokeWidth={1.8} />
                    <Text style={styles.searchingText}>Locating nearby mechanics & workshops…</Text>
                  </View>
                ) : (
                  <View style={styles.assignedRow}>
                    <View style={styles.mechanicAvatar}>
                      <User size={22} color="#E8490F" strokeWidth={2} />
                      <View style={styles.mechanicOnline} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.mechanicName}>Zahid Khan</Text>
                      <View style={styles.mechanicMeta}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={1.5} />
                        <Text style={styles.mechanicRating}>4.9</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.mechanicSpec}>Toyota Specialist</Text>
                      </View>
                    </View>
                    <View style={styles.mechanicEta}>
                      <MapPin size={13} color="#E8490F" strokeWidth={2} />
                      <Text style={styles.mechanicEtaText}>1.4 km</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.trackBtn} activeOpacity={0.85}
                  disabled={requestStatus === 'Searching'}>
                  <Navigation2 size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.trackBtnText}>Live Track</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.simBtn} onPress={advanceStatus} activeOpacity={0.8}>
                  {requestStatus === 'Completed'
                    ? <RotateCcw size={15} color={Colors.White} strokeWidth={2} />
                    : <Zap size={15} color={Colors.White} strokeWidth={2} />}
                  <Text style={styles.simBtnText}>
                    {requestStatus === 'Completed' ? 'Reset' : 'Next Step'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Safety card */}
            <View style={styles.safetyCard}>
              <View style={styles.safetyIcon}>
                <Lock size={16} color="#E8490F" strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.safetyTitle}>Secure & Protected</Text>
                <Text style={styles.safetyBody}>In case of delays, the system auto-sends SMS alerts to your SOS emergency contacts.</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {mockPastRequests.map(req => {
              const {Icon, color, bg} = typeConfig[req.type];
              const done = req.status === 'Completed';
              return (
                <TouchableOpacity key={req.id} style={styles.pastCard}
                  activeOpacity={0.85} onPress={() => setSelectedRequest(req)}>
                  <View style={styles.pastCardTop}>
                    <View style={styles.pastTypeRow}>
                      <View style={[styles.pastTypeIcon, {backgroundColor: bg}]}>
                        <Icon size={18} color={color} strokeWidth={2} />
                      </View>
                      <View>
                        <Text style={styles.pastTypeName}>{req.type} Service</Text>
                        <Text style={styles.pastDateTime}>{req.dateTime}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: done ? 'rgba(16,185,129,0.1)' : 'rgba(234,67,53,0.1)', borderColor: done ? 'rgba(16,185,129,0.25)' : 'rgba(234,67,53,0.25)'}]}>
                      {done
                        ? <CheckCircle size={11} color="#10B981" strokeWidth={2.5} />
                        : <X size={11} color="#EA4335" strokeWidth={2.5} />}
                      <Text style={[styles.statusBadgeText, {color: done ? '#10B981' : '#EA4335'}]}>{req.status}</Text>
                    </View>
                  </View>
                  <View style={styles.pastCardBody}>
                    <View style={styles.pastRow}>
                      <View style={styles.pastRowIcon}><User size={13} color={Colors.GreyText} strokeWidth={1.8} /></View>
                      <Text style={styles.pastLabel}>Provider</Text>
                      <Text style={styles.pastVal}>{req.name}</Text>
                    </View>
                    <View style={styles.pastRow}>
                      <View style={styles.pastRowIcon}><CreditCard size={13} color={Colors.GreyText} strokeWidth={1.8} /></View>
                      <Text style={styles.pastLabel}>Amount</Text>
                      <Text style={[styles.pastVal, styles.costVal]}>{req.cost}</Text>
                    </View>
                  </View>
                  <View style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>View Timeline</Text>
                    <ChevronRight size={14} color="#E8490F" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Timeline Modal */}
      <Modal visible={selectedRequest !== null} animationType="slide" transparent onRequestClose={() => setSelectedRequest(null)}>
        <View style={ms.backdrop}>
          <TouchableOpacity style={ms.flex} activeOpacity={1} onPress={() => setSelectedRequest(null)} />
          <View style={ms.sheet}>
            <View style={ms.indicator} />
            <View style={ms.sheetHeader}>
              <Text style={ms.sheetTitle}>Request Timeline</Text>
              <TouchableOpacity onPress={() => setSelectedRequest(null)} style={ms.closeBtn}>
                <X size={18} color={Colors.GreyText} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {selectedRequest && (() => {
              const {Icon, color, bg} = typeConfig[selectedRequest.type];
              const done = selectedRequest.status === 'Completed';
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={ms.reqBanner}>
                    <View style={[ms.reqIcon, {backgroundColor: bg}]}>
                      <Icon size={20} color={color} strokeWidth={2} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={ms.reqType}>{selectedRequest.type} Service</Text>
                      <Text style={ms.reqProvider}>{selectedRequest.name}</Text>
                    </View>
                    <View>
                      <Text style={[ms.reqCost, {color: done ? '#10B981' : '#EA4335'}]}>{selectedRequest.cost}</Text>
                      <View style={[ms.reqBadge, {backgroundColor: done ? 'rgba(16,185,129,0.1)' : 'rgba(234,67,53,0.1)'}]}>
                        {done
                          ? <CheckCircle size={10} color="#10B981" strokeWidth={2.5} />
                          : <X size={10} color="#EA4335" strokeWidth={2.5} />}
                        <Text style={[ms.reqBadgeText, {color: done ? '#10B981' : '#EA4335'}]}>{selectedRequest.status}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={ms.dateRow}>
                    <Clock size={13} color={Colors.GreyText} strokeWidth={1.8} />
                    <Text style={ms.dateText}>{selectedRequest.dateTime}</Text>
                  </View>
                  <Text style={ms.timelineTitle}>Chronological Log</Text>
                  {selectedRequest.details.map((log, i) => {
                    const isLast = i === selectedRequest.details.length - 1;
                    return (
                      <View key={i} style={ms.timelineItem}>
                        <View style={ms.timelineDotCol}>
                          <View style={[ms.timelineDot, isLast && {backgroundColor: '#E8490F'}]} />
                          {!isLast && <View style={ms.timelineLine} />}
                        </View>
                        <Text style={ms.timelineLog}>{log}</Text>
                      </View>
                    );
                  })}
                  <View style={{height: 12}} />
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bgColor},
  header: {paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 48 : 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'},
  headerTitle: {fontFamily: FontFamily.UrbanistBold, fontSize: 26, color: Colors.White},
  tabBar: {flexDirection: 'row', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 0, backgroundColor: Colors.bgColor},
  tabBtn: {flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 6},
  tabBtnActive: {borderBottomColor: '#E8490F'},
  tabBtnText: {fontFamily: FontFamily.UrbanistSemiBold, fontSize: 15, color: Colors.GreyText},
  tabBtnTextActive: {fontFamily: FontFamily.UrbanistBold, fontSize: 15, color: Colors.White},
  liveIndicator: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#E8490F'},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 20},
  activeCard: {backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', padding: 20, marginBottom: 18},
  activeCardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statusDot: {width: 9, height: 9, borderRadius: 5},
  statusLabel: {fontFamily: FontFamily.UrbanistMedium, fontSize: 14, color: Colors.GreyText},
  statusVal: {fontFamily: FontFamily.UrbanistBold},
  etaBox: {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(232,73,15,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10},
  etaText: {fontFamily: FontFamily.UrbanistBold, fontSize: 13, color: '#E8490F'},
  stepper: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4},
  stepWrap: {alignItems: 'center', flex: 1},
  stepConnectorRow: {flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center'},
  connector: {position: 'absolute', left: '-50%', right: '50%', height: 2, top: 11, zIndex: 1},
  stepNode: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#1A1A1F', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', zIndex: 2},
  stepDone: {backgroundColor: '#E8490F', borderColor: '#E8490F'},
  stepLabel: {fontFamily: FontFamily.UrbanistRegular, fontSize: 11, color: Colors.GreyText, marginTop: 6, textAlign: 'center'},
  stepLabelActive: {fontFamily: FontFamily.UrbanistBold, color: Colors.White},
  mechanicBox: {backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)'},
  searchingBox: {alignItems: 'center', gap: 10, paddingVertical: 10},
  searchingText: {fontFamily: FontFamily.UrbanistMedium, fontSize: 13, color: Colors.GreyText, textAlign: 'center'},
  assignedRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  mechanicAvatar: {width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(232,73,15,0.1)', justifyContent: 'center', alignItems: 'center'},
  mechanicOnline: {position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#030005'},
  mechanicName: {fontFamily: FontFamily.UrbanistBold, fontSize: 16, color: Colors.White, marginBottom: 3},
  mechanicMeta: {flexDirection: 'row', alignItems: 'center', gap: 5},
  mechanicRating: {fontFamily: FontFamily.UrbanistBold, fontSize: 12, color: Colors.White},
  metaDot: {width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)'},
  mechanicSpec: {fontFamily: FontFamily.UrbanistMedium, fontSize: 12, color: Colors.GreyText},
  mechanicEta: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(232,73,15,0.08)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9},
  mechanicEtaText: {fontFamily: FontFamily.UrbanistBold, fontSize: 12, color: '#E8490F'},
  actionRow: {flexDirection: 'row', gap: 10},
  trackBtn: {flex: 1.4, height: 48, borderRadius: 14, backgroundColor: '#E8490F', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, shadowColor: '#E8490F', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 5},
  trackBtnText: {fontFamily: FontFamily.UrbanistBold, fontSize: 14, color: '#FFFFFF'},
  simBtn: {flex: 1, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7},
  simBtnText: {fontFamily: FontFamily.UrbanistSemiBold, fontSize: 13, color: Colors.White},
  safetyCard: {backgroundColor: 'rgba(232,73,15,0.04)', borderWidth: 1, borderColor: 'rgba(232,73,15,0.1)', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 16},
  safetyIcon: {width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(232,73,15,0.1)', justifyContent: 'center', alignItems: 'center'},
  safetyTitle: {fontFamily: FontFamily.UrbanistBold, fontSize: 14, color: '#E8490F', marginBottom: 4},
  safetyBody: {fontFamily: FontFamily.UrbanistRegular, fontSize: 12, color: Colors.GreyText, lineHeight: 17},
  pastCard: {backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', padding: 18, marginBottom: 14},
  pastCardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)'},
  pastTypeRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  pastTypeIcon: {width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center'},
  pastTypeName: {fontFamily: FontFamily.UrbanistBold, fontSize: 15, color: Colors.White, marginBottom: 2},
  pastDateTime: {fontFamily: FontFamily.UrbanistRegular, fontSize: 12, color: Colors.GreyText},
  statusBadge: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, borderWidth: 0.5},
  statusBadgeText: {fontFamily: FontFamily.UrbanistBold, fontSize: 10, textTransform: 'uppercase'},
  pastCardBody: {gap: 9, marginBottom: 14},
  pastRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  pastRowIcon: {width: 20, justifyContent: 'center', alignItems: 'center'},
  pastLabel: {fontFamily: FontFamily.UrbanistRegular, fontSize: 13, color: Colors.Grey, flex: 1},
  pastVal: {fontFamily: FontFamily.UrbanistMedium, fontSize: 13, color: Colors.White},
  costVal: {fontFamily: FontFamily.UrbanistBold, color: '#E8490F'},
  detailsBtn: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)', paddingTop: 12},
  detailsBtnText: {fontFamily: FontFamily.UrbanistSemiBold, fontSize: 13, color: '#E8490F'},
  bottomSpacer: {height: 100},
});

const ms = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(3,0,5,0.78)', justifyContent: 'flex-end'},
  flex: {flex: 1},
  sheet: {backgroundColor: '#0D0D12', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 36 : 28, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'},
  indicator: {width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 18},
  sheetHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
  sheetTitle: {fontFamily: FontFamily.UrbanistBold, fontSize: 20, color: Colors.White},
  closeBtn: {width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center'},
  reqBanner: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 12},
  reqIcon: {width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  reqType: {fontFamily: FontFamily.UrbanistBold, fontSize: 16, color: Colors.White, marginBottom: 2},
  reqProvider: {fontFamily: FontFamily.UrbanistRegular, fontSize: 12, color: Colors.GreyText},
  reqCost: {fontFamily: FontFamily.UrbanistBold, fontSize: 16, textAlign: 'right', marginBottom: 4},
  reqBadge: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7},
  reqBadgeText: {fontFamily: FontFamily.UrbanistBold, fontSize: 9, textTransform: 'uppercase'},
  dateRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18},
  dateText: {fontFamily: FontFamily.UrbanistMedium, fontSize: 13, color: Colors.GreyText},
  timelineTitle: {fontFamily: FontFamily.UrbanistBold, fontSize: 15, color: Colors.White, marginBottom: 14},
  timelineItem: {flexDirection: 'row', gap: 14, marginBottom: 18},
  timelineDotCol: {alignItems: 'center', width: 14},
  timelineDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 3},
  timelineLine: {width: 2, backgroundColor: 'rgba(255,255,255,0.08)', flex: 1, marginTop: 4},
  timelineLog: {flex: 1, fontFamily: FontFamily.UrbanistMedium, fontSize: 13, color: Colors.GreyText, lineHeight: 19},
});
