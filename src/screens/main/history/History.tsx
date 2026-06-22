import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  LayoutAnimation,
  Modal,
} from 'react-native';
import { Colors } from '../../../generalStyles/colors';
import { FontFamily } from '../../../generalStyles/generalFonts';

interface HistoryProps {
  navigation?: any;
}

interface PastRequest {
  id: string;
  type: 'Emergency' | 'Tow' | 'Workshop';
  icon: string;
  dateTime: string;
  name: string;
  cost: string;
  status: 'Completed' | 'Cancelled';
  details: string[];
}

const mockPastRequests: PastRequest[] = [
  {
    id: 'p1',
    type: 'Emergency',
    icon: '🆘',
    dateTime: '22 June 2026, 02:30 PM',
    name: 'Zahid Khan (Mechanic)',
    cost: 'PKR 1,500',
    status: 'Completed',
    details: [
      '02:15 PM - Emergency SOS triggered by user',
      '02:18 PM - Mechanic Zahid Khan accepted the request',
      '02:22 PM - Mechanic arrived at Kalma Chowk, Lahore',
      '02:30 PM - Jumpstart completed & payment verified',
    ],
  },
  {
    id: 'p2',
    type: 'Tow',
    icon: '🛻',
    dateTime: '18 June 2026, 11:00 AM',
    name: 'Lahore Towing Co.',
    cost: 'PKR 4,500',
    status: 'Completed',
    details: [
      '10:45 AM - Flatbed tow truck requested',
      '10:52 AM - Tow truck assigned (Plate: LHR-9988)',
      '11:15 AM - Vehicle loaded near Model Town',
      '11:40 AM - Vehicle delivered to Auto Experts Workshop',
    ],
  },
  {
    id: 'p3',
    type: 'Workshop',
    icon: '🏭',
    dateTime: '10 June 2026, 04:15 PM',
    name: 'QuickFix Car Service',
    cost: 'PKR 8,200',
    status: 'Cancelled',
    details: [
      '03:50 PM - Workshop booking requested',
      '04:10 PM - Booking cancelled due to service unavailability',
    ],
  },
];

export const History: React.FC<HistoryProps> = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [activeRequestStatus, setActiveRequestStatus] = useState<
    'Searching' | 'Assigned' | 'En Route' | 'Completed'
  >('En Route');
  
  // Timer for active request
  const [etaSeconds, setEtaSeconds] = useState(720); // 12 minutes
  const [selectedPastRequest, setSelectedPastRequest] = useState<PastRequest | null>(null);

  useEffect(() => {
    let interval: any;
    if (activeRequestStatus !== 'Completed') {
      interval = setInterval(() => {
        setEtaSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setActiveRequestStatus('Completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRequestStatus]);

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`;
  };

  const advanceRequest = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeRequestStatus === 'Searching') {
      setActiveRequestStatus('Assigned');
    } else if (activeRequestStatus === 'Assigned') {
      setActiveRequestStatus('En Route');
      setEtaSeconds(720); // Reset timer to 12 minutes
    } else if (activeRequestStatus === 'En Route') {
      setActiveRequestStatus('Completed');
      setEtaSeconds(0);
    } else {
      setActiveRequestStatus('Searching');
      setEtaSeconds(45); // Short wait for searching phase
    }
  };

  const getStatusStepIndex = () => {
    switch (activeRequestStatus) {
      case 'Searching':
        return 0;
      case 'Assigned':
        return 1;
      case 'En Route':
        return 2;
      case 'Completed':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Title Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests & History</Text>
      </View>

      {/* ── Segmented Navigation Tabs ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveTab('active');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}>
            Active Requests
          </Text>
          {activeRequestStatus !== 'Completed' && (
            <View style={styles.activeDotBadge} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveTab('past');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'past' && styles.tabButtonTextActive]}>
            Past Requests
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── ACTIVE REQUEST TAB CONTENT ── */}
        {activeTab === 'active' ? (
          <View>
            <View style={styles.activeRequestCard}>
              <View style={styles.activeHeaderRow}>
                <View style={styles.statusBadgeWrapper}>
                  <View
                    style={[
                      styles.statusPulseDot,
                      {
                        backgroundColor:
                          activeRequestStatus === 'Completed'
                            ? '#10B981'
                            : activeRequestStatus === 'Searching'
                            ? '#3B82F6'
                            : '#E8490F',
                      },
                    ]}
                  />
                  <Text style={styles.activeStatusLabel}>
                    Status: <Text style={styles.activeStatusVal}>{activeRequestStatus}</Text>
                  </Text>
                </View>
                {activeRequestStatus !== 'Completed' && (
                  <Text style={styles.etaTimer}>
                    ⏱️ {formatEta(etaSeconds)}
                  </Text>
                )}
              </View>

              {/* Step Progress Tracker */}
              <View style={styles.stepperContainer}>
                {['Search', 'Assign', 'En Route', 'Done'].map((step, idx) => {
                  const stepIdx = getStatusStepIndex();
                  const isDone = idx < stepIdx;
                  const isActive = idx === stepIdx;

                  return (
                    <View key={step} style={styles.stepWrapper}>
                      <View style={styles.connectorRow}>
                        {idx > 0 && (
                          <View
                            style={[
                              styles.stepConnector,
                              { backgroundColor: idx <= stepIdx ? '#E8490F' : 'rgba(255, 255, 255, 0.1)' },
                            ]}
                          />
                        )}
                        <View
                          style={[
                            styles.stepNode,
                            isDone && styles.stepNodeDone,
                            isActive && styles.stepNodeActive,
                          ]}
                        >
                          {isDone ? (
                            <Text style={styles.stepCheckmark}>✓</Text>
                          ) : (
                            <View
                              style={[
                                styles.stepInnerDot,
                                isActive && { backgroundColor: '#E8490F' },
                              ]}
                            />
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          (isActive || isDone) && styles.stepTextActive,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Mechanic Assignment Information */}
              <View style={styles.assignedDetailsContainer}>
                {activeRequestStatus === 'Searching' ? (
                  <View style={styles.searchingLoaderWrapper}>
                    <Text style={styles.searchingEmoji}>📡</Text>
                    <Text style={styles.searchingText}>Searching for nearby workshops & mechanics...</Text>
                  </View>
                ) : (
                  <View style={styles.mechanicRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarEmoji}>👨‍🔧</Text>
                    </View>
                    <View style={styles.mechanicTextWrapper}>
                      <Text style={styles.mechanicNameText}>Zahid Khan</Text>
                      <View style={styles.ratingStarsRow}>
                        <Text style={styles.starIconSmall}>⭐</Text>
                        <Text style={styles.ratingValText}>4.9</Text>
                        <Text style={styles.dividerDot}>•</Text>
                        <Text style={styles.specializationText}>Toyota Specialist</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.activeActionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.liveTrackBtn]}
                  activeOpacity={0.8}
                  disabled={activeRequestStatus === 'Searching'}
                >
                  <Text style={styles.liveTrackBtnText}>🗺️ Live Tracking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.demoBtn]}
                  onPress={advanceRequest}
                  activeOpacity={0.8}
                >
                  <Text style={styles.demoBtnText}>
                    {activeRequestStatus === 'Completed' ? '🔄 Reset Request' : '⚡ Sim Next Step'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Safety Banner */}
            <View style={styles.safetyInfoCard}>
              <Text style={styles.safetyTitle}>🔒 Locked & Secured Guarantee</Text>
              <Text style={styles.safetyBody}>
                Your safety is our priority. In case of emergency delays, our system falls back to automated SMS sharing with your SOS contacts.
              </Text>
            </View>
          </View>
        ) : (
          /* ── PAST REQUESTS TAB CONTENT ── */
          <View>
            {mockPastRequests.map(request => (
              <TouchableOpacity
                key={request.id}
                style={styles.pastRequestCard}
                activeOpacity={0.85}
                onPress={() => setSelectedPastRequest(request)}
              >
                <View style={styles.pastCardHeader}>
                  <View style={styles.pastTypeRow}>
                    <View style={styles.pastIconContainer}>
                      <Text style={styles.pastIconEmoji}>{request.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.pastTypeName}>{request.type} Service</Text>
                      <Text style={styles.pastDateTime}>{request.dateTime}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          request.status === 'Completed'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(234, 67, 53, 0.1)',
                        borderColor:
                          request.status === 'Completed'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(234, 67, 53, 0.2)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: request.status === 'Completed' ? '#10B981' : '#EA4335' },
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.pastCardBody}>
                  <View style={styles.pastDetailsRow}>
                    <Text style={styles.pastLabelText}>Provider</Text>
                    <Text style={styles.pastValText}>{request.name}</Text>
                  </View>
                  <View style={styles.pastDetailsRow}>
                    <Text style={styles.pastLabelText}>Final Amount</Text>
                    <Text style={[styles.pastValText, styles.pastCostHighlight]}>
                      {request.cost}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPastRequest(request)}
                >
                  <Text style={styles.detailsBtnText}>View Details Timeline →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── TIMELINE DETAILS BOTTOM SHEET MODAL ── */}
      <Modal
        visible={selectedPastRequest !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPastRequest(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalFlexSpacer}
            activeOpacity={1}
            onPress={() => setSelectedPastRequest(null)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Timeline</Text>
              <TouchableOpacity onPress={() => setSelectedPastRequest(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedPastRequest && (
              <View style={styles.modalBody}>
                <View style={styles.modalCardHeader}>
                  <Text style={styles.modalCardType}>
                    {selectedPastRequest.icon} {selectedPastRequest.type} Service
                  </Text>
                  <Text style={styles.modalCardCost}>{selectedPastRequest.cost}</Text>
                </View>
                <Text style={styles.modalCardProvider}>Provider: {selectedPastRequest.name}</Text>
                <Text style={styles.modalCardDate}>{selectedPastRequest.dateTime}</Text>

                <Text style={styles.timelineLabel}>Chronological Log</Text>
                <View style={styles.timelineList}>
                  {selectedPastRequest.details.map((log, index) => {
                    const isLast = index === selectedPastRequest.details.length - 1;
                    return (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineDotColumn}>
                          <View
                            style={[
                              styles.timelineDot,
                              isLast && { backgroundColor: '#E8490F' },
                            ]}
                          />
                          {!isLast && <View style={styles.timelineLine} />}
                        </View>
                        <Text style={styles.timelineLogText}>{log}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#030005',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 24,
    color: Colors.White || '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: Colors.bgColor || '#030005',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabButtonActive: {
    borderBottomColor: '#E8490F',
  },
  tabButtonText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 15,
    color: Colors.GreyText || '#A7A7A7',
  },
  tabButtonTextActive: {
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistBold || 'System',
  },
  activeDotBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8490F',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  /* Active Request Card */
  activeRequestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 20,
    marginBottom: 20,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  statusBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeStatusLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
  },
  activeStatusVal: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    color: Colors.White || '#FFFFFF',
  },
  etaTimer: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#E8490F',
  },
  /* Stepper Progress Tracker */
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepConnector: {
    position: 'absolute',
    left: '-50%',
    right: '50%',
    height: 2.5,
    top: 10,
    zIndex: 1,
  },
  stepNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E1D1C',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepNodeActive: {
    borderColor: '#E8490F',
    backgroundColor: '#030005',
  },
  stepNodeDone: {
    backgroundColor: '#E8490F',
    borderColor: '#E8490F',
  },
  stepCheckmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  stepInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 11,
    color: Colors.GreyText || '#A7A7A7',
    marginTop: 6,
    textAlign: 'center',
  },
  stepTextActive: {
    color: Colors.White || '#FFFFFF',
    fontFamily: FontFamily.UrbanistBold || 'System',
  },
  /* Assigned details */
  assignedDetailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  searchingLoaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  searchingEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  searchingText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
    textAlign: 'center',
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  mechanicTextWrapper: {
    flex: 1,
  },
  mechanicNameText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: Colors.White || '#FFFFFF',
    marginBottom: 2,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconSmall: {
    fontSize: 12,
    marginRight: 3,
  },
  ratingValText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 12,
    color: Colors.White || '#FFFFFF',
  },
  dividerDot: {
    color: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 6,
    fontSize: 10,
  },
  specializationText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  /* Action buttons */
  activeActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveTrackBtn: {
    backgroundColor: '#E8490F',
  },
  liveTrackBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#FFFFFF',
  },
  demoBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  demoBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
  },
  safetyInfoCard: {
    backgroundColor: 'rgba(232, 73, 15, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(232, 73, 15, 0.1)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
  },
  safetyTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#E8490F',
    marginBottom: 4,
  },
  safetyBody: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
    lineHeight: 16,
  },
  /* Past Request Card */
  pastRequestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 18,
    marginBottom: 16,
  },
  pastCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 14,
    marginBottom: 14,
  },
  pastTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pastIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastIconEmoji: {
    fontSize: 20,
  },
  pastTypeName: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
    marginBottom: 2,
  },
  pastDateTime: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  statusBadgeText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  pastCardBody: {
    gap: 8,
    marginBottom: 14,
  },
  pastDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastLabelText: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.Grey || '#868686',
  },
  pastValText: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
  },
  pastCostHighlight: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    color: '#E8490F',
  },
  detailsBtn: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
    alignItems: 'center',
  },
  detailsBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: '#E8490F',
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
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 20,
    color: Colors.White || '#FFFFFF',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
  },
  closeBtnText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 13,
    color: Colors.White || '#FFFFFF',
  },
  modalBody: {
    paddingTop: 4,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCardType: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 17,
    color: Colors.White || '#FFFFFF',
  },
  modalCardCost: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 17,
    color: '#E8490F',
  },
  modalCardProvider: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 4,
  },
  modalCardDate: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.Grey || '#868686',
    marginBottom: 20,
  },
  timelineLabel: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
    marginBottom: 14,
  },
  timelineList: {
    paddingLeft: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timelineDotColumn: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    top: 14,
    bottom: -16,
  },
  timelineLogText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
    lineHeight: 18,
  },
});
