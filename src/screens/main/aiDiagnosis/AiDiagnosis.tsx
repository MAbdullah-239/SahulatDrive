import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../../navigation/mainStackNavigation';
import {MainStack as MainStackConstants} from '../../../constants/stack/mainStack/mainStack';

interface SampleIssue {
  id: string;
  name: string;
  emoji: string;
  photoEmoji: string;
  title: string;
  description: string;
  confidence: string;
  severity: 'Critical' | 'Moderate' | 'Low';
  estimatedCost: string;
}

const sampleIssues: SampleIssue[] = [
  {
    id: 'engine_smoke',
    name: 'Engine Smoke',
    emoji: '💨',
    photoEmoji: '💨🚗💨',
    title: 'Coolant Leak / Head Gasket Failure',
    description: 'White smoke from the engine bay or exhaust typically indicates coolant entering the combustion chamber. This is likely due to a blown head gasket or cracked engine block. Do not drive to prevent severe engine damage.',
    confidence: '96%',
    severity: 'Critical',
    estimatedCost: 'PKR 25,000 - 45,000',
  },
  {
    id: 'slashed_tyre',
    name: 'Slashed Tyre',
    emoji: '⚙️',
    photoEmoji: '🛞⚠️',
    title: 'Sidewall Damage / Blowout Risk',
    description: 'Deep sidewall cuts or slashes compromises the structural integrity of the tire. It cannot be safely repaired and must be replaced immediately. Avoid high-speed driving.',
    confidence: '98%',
    severity: 'Critical',
    estimatedCost: 'PKR 12,000 - 18,000',
  },
  {
    id: 'car_dent',
    name: 'Fender Dent',
    emoji: '🚗',
    photoEmoji: '💥🚙',
    title: 'Fender Dent & Paint Scratches',
    description: 'Minor impact damage on the front-left fender. The metal is warped but underlying suspension and steering components appear unaffected. Paintless Dent Removal (PDR) is recommended.',
    confidence: '92%',
    severity: 'Low',
    estimatedCost: 'PKR 4,000 - 7,000',
  },
  {
    id: 'oil_leak',
    name: 'Oil Leak',
    emoji: '🛢️',
    photoEmoji: '💧🛢️',
    title: 'Engine Oil Pan Gasket Leak',
    description: 'Dark fluid accumulation underneath the engine oil pan. Oil level is slightly low. Continued operation with low oil will cause engine wear. Replace the oil pan gasket and top up oil.',
    confidence: '94%',
    severity: 'Moderate',
    estimatedCost: 'PKR 6,000 - 9,500',
  },
];

const AiDiagnosis: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [selectedPreset, setSelectedPreset] = useState<SampleIssue | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pickImage = (type: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      includeBase64: false,
    };

    const callback = (response: any) => {
      setPickerVisible(false);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage({ uri: asset.uri });
          setSelectedPreset({
            id: 'custom_upload',
            name: 'Uploaded Photo',
            emoji: '📸',
            photoEmoji: '📸',
            title: 'Body Panel Dent / Paint Scratches',
            description: 'AI Image analysis has detected structural deformation or paint surface anomalies on the uploaded car part. Recommended action: Standard dent removal and repaint to prevent rust.',
            confidence: '89%',
            severity: 'Low',
            estimatedCost: 'PKR 5,000 - 8,000',
          });
          setShowReport(false);
        }
      }
    };

    if (type === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  // Scan line animation loop
  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [isAnalyzing, scanAnim]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartAnalysis = () => {
    if (!selectedPreset) {
      return;
    }
    setIsAnalyzing(true);
    setProgress(0);
    setShowReport(false);

    let currentProgress = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 100) {
        setProgress(100);
        setIsAnalyzing(false);
        setShowReport(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        setProgress(currentProgress);
      }
    }, 150);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 190], // matches height of visual container
  });

  const getSeverityColor = (severity: 'Critical' | 'Moderate' | 'Low') => {
    switch (severity) {
      case 'Critical':
        return '#EA4335';
      case 'Moderate':
        return '#DC5932';
      case 'Low':
        return '#34C85A';
      default:
        return Colors.White;
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
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Diagnosis</Text>
        <TouchableOpacity style={styles.historyButton} activeOpacity={0.7}>
          <Text style={styles.historyIcon}>📄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Camera/Upload Visual Container ── */}
        <TouchableOpacity
          style={styles.visualContainer}
          onPress={() => !isAnalyzing && setPickerVisible(true)}
          activeOpacity={isAnalyzing ? 1 : 0.85}
          disabled={isAnalyzing}
        >
          {selectedImage ? (
            <View style={styles.uploadedPhotoBox}>
              <Image source={{uri: selectedImage.uri}} style={styles.uploadedImage} resizeMode="cover" />
              {isAnalyzing && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{translateY}],
                    },
                  ]}
                />
              )}
            </View>
          ) : selectedPreset ? (
            <View style={styles.uploadedPhotoBox}>
              <Text style={styles.uploadedPhotoEmoji}>{selectedPreset.photoEmoji}</Text>
              {isAnalyzing && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{translateY}],
                    },
                  ]}
                />
              )}
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderCamera}>📸</Text>
              <Text style={styles.placeholderText}>Scan or Upload Photo</Text>
              <Text style={styles.placeholderSubtext}>Select a preset issue below or upload your own</Text>
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.progressOverlay}>
              <Text style={styles.progressText}>Analyzing... {progress}%</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Select Preset / Sample Grid ── */}
        {!isAnalyzing && (
          <View style={styles.presetSection}>
            <Text style={styles.sectionTitle}>Select Sample Issue</Text>
            <View style={styles.presetGrid}>
              {sampleIssues.map(issue => {
                const isSelected = selectedPreset?.id === issue.id && !selectedImage;
                return (
                  <TouchableOpacity
                    key={issue.id}
                    style={[
                      styles.presetCard,
                      isSelected ? styles.presetCardActive : styles.presetCardInactive,
                    ]}
                    onPress={() => {
                      setSelectedPreset(issue);
                      setSelectedImage(null);
                      setShowReport(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.presetEmoji}>{issue.emoji}</Text>
                    <Text
                      style={[
                        styles.presetLabel,
                        isSelected ? styles.presetLabelActive : styles.presetLabelInactive,
                      ]}
                    >
                      {issue.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Analyze Button ── */}
        {selectedPreset && !isAnalyzing && !showReport && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleStartAnalysis}
            activeOpacity={0.85}
          >
            <Text style={styles.analyzeButtonText}>🤖 Analyze Photo</Text>
          </TouchableOpacity>
        )}

        {/* ── AI Diagnosis Report Card ── */}
        {showReport && selectedPreset && (
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleRow}>
                <Text style={styles.reportIcon}>🤖</Text>
                <Text style={styles.reportTitleText}>Diagnosis Report</Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  {backgroundColor: getSeverityColor(selectedPreset.severity) + '1A'},
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    {color: getSeverityColor(selectedPreset.severity)},
                  ]}
                >
                  {selectedPreset.severity}
                </Text>
              </View>
            </View>

            <View style={styles.reportDivider} />

            <Text style={styles.predictionTitle}>{selectedPreset.title}</Text>
            <Text style={styles.predictionDesc}>{selectedPreset.description}</Text>

            <View style={styles.reportStatsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Confidence</Text>
                <Text style={styles.statValue}>{selectedPreset.confidence}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Est. Repair Cost</Text>
                <Text style={[styles.statValue, styles.costText]}>
                  {selectedPreset.estimatedCost}
                </Text>
              </View>
            </View>

            {/* Actions linked to rest of the app */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  navigation.navigate(MainStackConstants.nestedScreens.BookWorkshop.name)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.bookBtnText}>Book Workshop</Text>
              </TouchableOpacity>

              {selectedPreset.severity === 'Critical' && (
                <TouchableOpacity
                  style={styles.emergencyBtn}
                  onPress={() =>
                    navigation.navigate(MainStackConstants.nestedScreens.RequestHelp.name)
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.emergencyBtnText}>🆘 Request Help</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Photo Picker Modal ── */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Photo</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('camera')}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionText}>📸 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('library')}
              activeOpacity={0.7}
            >
              <Text style={styles.modalOptionText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AiDiagnosis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor || '#030005',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.White || '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  headerTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 22,
    color: Colors.White || '#FFFFFF',
    fontWeight: 'bold',
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  /* ── Visual Upload Container ── */
  visualContainer: {
    height: 230,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(232, 73, 15, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCamera: {
    fontSize: 44,
    marginBottom: 12,
  },
  placeholderText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
    marginBottom: 6,
  },
  placeholderSubtext: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 13,
    color: Colors.GreyText || '#A7A7A7',
  },
  uploadedPhotoBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedPhotoEmoji: {
    fontSize: 70,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: '#E8490F',
    shadowColor: '#E8490F',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 5,
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 16,
    alignItems: 'center',
  },
  progressText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '90%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E8490F',
    borderRadius: 3,
  },
  /* ── Preset Issue Section ── */
  presetSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 20,
    color: Colors.White || '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  presetCard: {
    width: '48%',
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  presetCardInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'transparent',
  },
  presetCardActive: {
    backgroundColor: 'rgba(232, 73, 15, 0.08)',
    borderColor: '#E8490F',
  },
  presetEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  presetLabel: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 15,
    fontWeight: '600',
  },
  presetLabelInactive: {
    color: Colors.White || '#FFFFFF',
  },
  presetLabelActive: {
    color: '#E8490F',
  },
  /* ── Buttons ── */
  analyzeButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#E8490F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
    marginBottom: 20,
  },
  analyzeButtonText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  /* ── Report Card ── */
  reportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportIcon: {
    fontSize: 20,
  },
  reportTitleText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
    fontWeight: '700',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  severityText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  predictionTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 19,
    color: Colors.White || '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  predictionDesc: {
    fontFamily: FontFamily.UrbanistRegular || 'System',
    fontSize: 14,
    color: Colors.GreyText || '#A7A7A7',
    lineHeight: 20,
    marginBottom: 20,
  },
  reportStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statLabel: {
    fontFamily: FontFamily.UrbanistMedium || 'System',
    fontSize: 12,
    color: Colors.GreyText || '#A7A7A7',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 15,
    color: Colors.White || '#FFFFFF',
  },
  costText: {
    color: '#E8490F',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  bookBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#E8490F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: Colors.White || '#FFFFFF',
    fontWeight: '700',
  },
  emergencyBtn: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#EA4335',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBtnText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 14,
    color: '#EA4335',
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121214',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 18,
    color: Colors.White || '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionText: {
    fontFamily: FontFamily.UrbanistSemiBold || 'System',
    fontSize: 16,
    color: Colors.White || '#FFFFFF',
  },
  modalCancelButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontFamily: FontFamily.UrbanistBold || 'System',
    fontSize: 16,
    color: '#8A94A6',
  },
});
