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
  Alert,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {
  CheckCircle,
  Upload,
  FileText,
  CreditCard,
  Briefcase,
} from 'lucide-react-native';

interface DocumentItem {
  type: 'cnic_front' | 'cnic_back' | 'license' | 'business';
  label: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
}

const ProviderUploadDocuments: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const {categories = [], towTruck} = route.params || {};
  // If towTruck param exists, user came via AddTowTruck → this is step 3
  // Otherwise came directly from SelectServices → step 2
  const stepNumber = towTruck ? 3 : 2;
  const totalSteps = towTruck ? 4 : 3;

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      type: 'cnic_front',
      label: 'CNIC — Front Side',
      subtitle: 'National ID card, front side',
      icon: CreditCard,
      iconColor: '#3B82F6',
      required: true,
      uploaded: false,
    },
    {
      type: 'cnic_back',
      label: 'CNIC — Back Side',
      subtitle: 'National ID card, back side',
      icon: CreditCard,
      iconColor: '#8B5CF6',
      required: true,
      uploaded: false,
    },
    {
      type: 'license',
      label: "Driver's License",
      subtitle: 'Valid Pakistani driving license',
      icon: FileText,
      iconColor: '#10B981',
      required: true,
      uploaded: false,
    },
    {
      type: 'business',
      label: 'Business / Tax Registration',
      subtitle: 'NTN or business registration (optional)',
      icon: Briefcase,
      iconColor: '#F59E0B',
      required: false,
      uploaded: false,
    },
  ]);

  const simulateUpload = (type: DocumentItem['type']) => {
    // In production this will use react-native-image-picker
    Alert.alert(
      'Upload Document',
      'In production this opens the camera/gallery to upload your document.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Simulate Upload',
          onPress: () => {
            setDocuments(prev =>
              prev.map(doc =>
                doc.type === type
                  ? {...doc, uploaded: true, fileName: 'document.jpg'}
                  : doc,
              ),
            );
          },
        },
      ],
    );
  };

  const requiredDocs = documents.filter(d => d.required);
  const allRequiredUploaded = requiredDocs.every(d => d.uploaded);
  const uploadedCount = documents.filter(d => d.uploaded).length;
  const uploadProgressPct = Math.round((uploadedCount / documents.length) * 100);

  const handleContinue = () => {
    navigation.navigate(AuthStack.nestedScreens.ProviderPendingApproval.name, {
      categories,
    });
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
        <View style={styles.stepRow}>
          {Array.from({length: totalSteps}).map((_, i) => {
            const s = i + 1;
            return (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  s < stepNumber && styles.stepDotActive,
                  s === stepNumber && styles.stepDotCurrent,
                ]}
              />
            );
          })}
        </View>
        <View style={{width: 44}} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Title ── */}
        <View style={styles.titleArea}>
          <Text style={styles.stepLabel}>Step {stepNumber} of {totalSteps}</Text>
          <Text style={styles.title}>Upload Your{'\n'}Documents</Text>
          <Text style={styles.subtitle}>
            These documents are used for verification. Your account will be reviewed
            by admin before you can go online.
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${uploadProgressPct}%`}]} />
        </View>
        <Text style={styles.progressText}>
          {uploadedCount} of {documents.length} uploaded
        </Text>

        {/* ── Document Cards ── */}
        <View style={styles.docList}>
          {documents.map(doc => {
            const Icon = doc.icon;
            return (
              <View
                key={doc.type}
                style={[
                  styles.docCard,
                  doc.uploaded && styles.docCardUploaded,
                ]}>
                <View style={[styles.iconWrap, {backgroundColor: doc.uploaded ? 'rgba(16,185,129,0.1)' : `${doc.iconColor}18`}]}>
                  {doc.uploaded ? (
                    <CheckCircle size={24} color="#10B981" strokeWidth={2} />
                  ) : (
                    <Icon size={24} color={doc.iconColor} strokeWidth={1.8} />
                  )}
                </View>

                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docLabel}>{doc.label}</Text>
                    {!doc.required && (
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalText}>Optional</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docSubtitle}>
                    {doc.uploaded ? `✓ Uploaded successfully` : doc.subtitle}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    doc.uploaded && styles.uploadBtnDone,
                  ]}
                  onPress={() => simulateUpload(doc.type)}
                  activeOpacity={0.8}>
                  {doc.uploaded ? (
                    <Text style={styles.uploadBtnTextDone}>✓</Text>
                  ) : (
                    <Upload size={18} color="#E8490F" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Info Box ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            Your documents are encrypted and only reviewed by the Sahulat Drive admin
            team for verification purposes.
          </Text>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomContainer}>
        {!allRequiredUploaded && (
          <Text style={styles.bottomNote}>
            Upload CNIC (front & back) and Driver's License to continue
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            !allRequiredUploaded && styles.primaryBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allRequiredUploaded}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Next → Submit for Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderUploadDocuments;

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
  stepDotActive: {backgroundColor: '#E8490F'},
  stepDotCurrent: {width: 24},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 8},
  titleArea: {marginBottom: 24},
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
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: '#E8490F',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
    marginBottom: 20,
  },
  docList: {gap: 12, marginBottom: 20},
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    gap: 14,
  },
  docCardUploaded: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.04)',
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {flex: 1},
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  docLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
  },
  optionalBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  optionalText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 10,
    color: Colors.GreyText,
  },
  docSubtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  uploadBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(232,73,15,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnDone: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  uploadBtnTextDone: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(59,130,246,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    padding: 14,
  },
  infoIcon: {fontSize: 16},
  infoText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 14,
    backgroundColor: Colors.bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  bottomNote: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
    textAlign: 'center',
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
    backgroundColor: 'rgba(232,73,15,0.3)',
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
