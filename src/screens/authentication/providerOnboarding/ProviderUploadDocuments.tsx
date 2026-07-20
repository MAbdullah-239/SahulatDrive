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
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {uploadProviderDocument} from '../../../requestHandler/api';
import {
  CheckCircle,
  Camera,
  FileText,
  CreditCard,
  Briefcase,
  X,
} from 'lucide-react-native';

/* ─── Types ─────────────────────────────────────────────────── */
type DocType = 'cnic_front' | 'cnic_back' | 'license' | 'business';

interface DocumentItem {
  type: DocType;
  label: string;
  subtitle: string;
  IconComponent: any;
  iconColor: string;
  required: boolean;
  localUri: string | null;   // local file URI after pick
  fileName: string | null;
  mimeType: string | null;
}

/* ─── Image Picker helper ─────────────────────────────────────
   Opens an action sheet offering Camera or Gallery, returns the
   picked asset or null if the user cancelled.
──────────────────────────────────────────────────────────────── */
const pickImage = (
  callback: (uri: string, name: string, mimeType: string) => void,
) => {
  Alert.alert(
    'Upload Document',
    'Choose how to provide this document',
    [
      {
        text: 'Take Photo',
        onPress: () => {
          launchCamera(
            {mediaType: 'photo' as MediaType, quality: 1, saveToPhotos: false},
            (res: ImagePickerResponse) => {
              if (res.didCancel || res.errorCode) return;
              const asset = res.assets?.[0];
              if (asset?.uri)
                callback(
                  asset.uri,
                  asset.fileName ?? 'photo.jpg',
                  asset.type ?? 'image/jpeg',
                );
            },
          );
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          launchImageLibrary(
            {mediaType: 'photo' as MediaType, quality: 1},
            (res: ImagePickerResponse) => {
              if (res.didCancel || res.errorCode) return;
              const asset = res.assets?.[0];
              if (asset?.uri)
                callback(
                  asset.uri,
                  asset.fileName ?? 'photo.jpg',
                  asset.type ?? 'image/jpeg',
                );
            },
          );
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ],
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const ProviderUploadDocuments: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const {categories = []} = route.params || {};
  const hasTowTruck = categories.includes('towing');

  const stepNumber = hasTowTruck ? 3 : 2;
  const totalSteps = hasTowTruck ? 4 : 3;

  /* Document state */
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      type: 'cnic_front',
      label: 'CNIC — Front Side',
      subtitle: 'Take a clear photo of the front of your national ID',
      IconComponent: CreditCard,
      iconColor: '#3B82F6',
      required: true,
      localUri: null,
      fileName: null,
      mimeType: null,
    },
    {
      type: 'cnic_back',
      label: 'CNIC — Back Side',
      subtitle: 'Take a clear photo of the back of your national ID',
      IconComponent: CreditCard,
      iconColor: '#8B5CF6',
      required: true,
      localUri: null,
      fileName: null,
      mimeType: null,
    },
    {
      type: 'license',
      label: "Driver's License",
      subtitle: 'Front side of your valid Pakistani driving license',
      IconComponent: FileText,
      iconColor: '#10B981',
      required: true,
      localUri: null,
      fileName: null,
      mimeType: null,
    },
    {
      type: 'business',
      label: 'Business / NTN Certificate',
      subtitle: 'Optional — business registration or tax certificate',
      IconComponent: Briefcase,
      iconColor: '#F59E0B',
      required: false,
      localUri: null,
      fileName: null,
      mimeType: null,
    },
  ]);

  /* CNIC / License metadata */
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicExpiry, setCnicExpiry] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Helpers ── */
  const setDocUri = (type: DocType, uri: string, name: string, mimeType: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.type === type ? {...d, localUri: uri, fileName: name, mimeType} : d,
      ),
    );
  };

  const clearDoc = (type: DocType) => {
    setDocuments(prev =>
      prev.map(d =>
        d.type === type
          ? {...d, localUri: null, fileName: null, mimeType: null}
          : d,
      ),
    );
  };

  const requiredUploaded = documents
    .filter(d => d.required)
    .every(d => d.localUri !== null);

  const uploadedCount = documents.filter(d => d.localUri !== null).length;
  const progressPct = Math.round((uploadedCount / documents.length) * 100);

  const cnicUploaded = documents.some(d => d.type === 'cnic_front' && d.localUri);
  const licenseUploaded = documents.some(d => d.type === 'license' && d.localUri);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!cnicNumber.trim() || !cnicExpiry.trim()) {
      Alert.alert('Missing Info', 'Please enter your CNIC number and expiry date.');
      return;
    }
    if (!licenseNumber.trim() || !licenseExpiry.trim()) {
      Alert.alert('Missing Info', "Please enter your driver's license number and expiry.");
      return;
    }

    setSubmitting(true);
    try {
      /* Tow truck (if towing was selected) is already registered on the
         previous screen — see ProviderAddTowTruck.tsx. */

      const cnicFront = documents.find(d => d.type === 'cnic_front');
      const license   = documents.find(d => d.type === 'license');
      const business  = documents.find(d => d.type === 'business');

      // The API stores one record per document_type, so CNIC front and back
      // can't both be submitted as a separate 'cnic' upload — only the front
      // (the side carrying the CNIC number) is sent.
      await uploadProviderDocument({
        document_type: 'cnic',
        document_number: cnicNumber,
        file: {
          uri: cnicFront!.localUri!,
          type: cnicFront!.mimeType ?? 'image/jpeg',
          name: cnicFront!.fileName ?? 'cnic.jpg',
        },
        expiry_date: cnicExpiry,
      });

      await uploadProviderDocument({
        document_type: 'license',
        document_number: licenseNumber,
        file: {
          uri: license!.localUri!,
          type: license!.mimeType ?? 'image/jpeg',
          name: license!.fileName ?? 'license.jpg',
        },
        expiry_date: licenseExpiry,
      });

      if (business?.localUri) {
        await uploadProviderDocument({
          document_type: 'business',
          document_number: 'NTN',
          file: {
            uri: business.localUri,
            type: business.mimeType ?? 'image/jpeg',
            name: business.fileName ?? 'business.jpg',
          },
          expiry_date: '2036-12-31',
        });
      }

      navigation.navigate(AuthStack.nestedScreens.ProviderPendingApproval.name, {
        categories,
      });
    } catch (err: any) {
      console.error('[ProviderUploadDocuments]', err?.response?.data ?? err);
      const backendMessage =
        err?.response?.data?.error ?? err?.response?.data?.message;
      Alert.alert(
        'Submission failed',
        backendMessage ??
          'Could not upload documents. Please check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      {/* Header */}
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

        {/* Title */}
        <View style={styles.titleArea}>
          <Text style={styles.stepLabel}>Step {stepNumber} of {totalSteps}</Text>
          <Text style={styles.title}>Upload Your{'\n'}Documents</Text>
          <Text style={styles.subtitle}>
            Tap each card to photograph or choose an image from your gallery.
            All required documents must be uploaded before you can continue.
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progressPct}%`}]} />
        </View>
        <Text style={styles.progressText}>
          {uploadedCount} of {documents.length} uploaded
        </Text>

        {/* Document cards */}
        <View style={styles.docList}>
          {documents.map(doc => {
            const Icon = doc.IconComponent;
            const uploaded = doc.localUri !== null;
            return (
              <TouchableOpacity
                key={doc.type}
                style={[styles.docCard, uploaded && styles.docCardUploaded]}
                activeOpacity={0.85}
                onPress={() =>
                  pickImage((uri, name, mimeType) =>
                    setDocUri(doc.type, uri, name, mimeType),
                  )
                }>

                {/* Left — thumbnail or icon */}
                {uploaded ? (
                  <View style={styles.thumbWrap}>
                    <Image
                      source={{uri: doc.localUri!}}
                      style={styles.thumb}
                      resizeMode="cover"
                    />
                    {/* Remove button */}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => clearDoc(doc.type)}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                      <X size={10} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={[styles.iconWrap, {backgroundColor: `${doc.iconColor}18`}]}>
                    <Icon size={24} color={doc.iconColor} strokeWidth={1.8} />
                  </View>
                )}

                {/* Middle — label & status */}
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
                    {uploaded
                      ? `✓ ${doc.fileName ?? 'Uploaded'}`
                      : doc.subtitle}
                  </Text>
                </View>

                {/* Right — camera / check icon */}
                <View
                  style={[
                    styles.actionBtn,
                    uploaded && styles.actionBtnDone,
                  ]}>
                  {uploaded ? (
                    <CheckCircle size={18} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Camera size={18} color="#E8490F" strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CNIC details — show after front is uploaded */}
        {cnicUploaded && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>CNIC Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CNIC Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 35201-1234567-8"
                placeholderTextColor={Colors.Grey}
                value={cnicNumber}
                onChangeText={setCnicNumber}
                keyboardType="numeric"
                selectionColor="#E8490F"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD  e.g. 2030-12-31"
                placeholderTextColor={Colors.Grey}
                value={cnicExpiry}
                onChangeText={setCnicExpiry}
                selectionColor="#E8490F"
              />
            </View>
          </View>
        )}

        {/* License details — show after license is uploaded */}
        {licenseUploaded && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Driver's License Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. LHE-123456"
                placeholderTextColor={Colors.Grey}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                autoCapitalize="characters"
                selectionColor="#E8490F"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD  e.g. 2029-08-25"
                placeholderTextColor={Colors.Grey}
                value={licenseExpiry}
                onChangeText={setLicenseExpiry}
                selectionColor="#E8490F"
              />
            </View>
          </View>
        )}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            Your documents are encrypted and only reviewed by the Sahulat Drive
            admin team for identity verification.
          </Text>
        </View>

        <View style={{height: 110}} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomContainer}>
        {!requiredUploaded && (
          <Text style={styles.bottomNote}>
            Upload CNIC (front & back) and Driver's License to continue
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!requiredUploaded || submitting) && styles.primaryBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!requiredUploaded || submitting}
          activeOpacity={0.85}>
          {submitting ? (
            <ActivityIndicator color={Colors.White} />
          ) : (
            <Text style={styles.primaryBtnText}>Submit for Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderUploadDocuments;

/* ─── Styles ──────────────────────────────────────────────────── */
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
    backgroundColor: '#E8490F',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
    marginBottom: 20,
  },

  /* Document cards */
  docList: {gap: 12, marginBottom: 20},
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    gap: 14,
  },
  docCardUploaded: {
    borderColor: 'rgba(16,185,129,0.35)',
    backgroundColor: 'rgba(16,185,129,0.04)',
  },

  /* Thumbnail */
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'visible',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  iconWrap: {
    width: 56,
    height: 56,
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
    fontSize: 14,
    color: Colors.White,
    flex: 1,
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
    lineHeight: 17,
  },

  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(232,73,15,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDone: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.3)',
  },

  /* Details form */
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  formTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#E8490F',
    marginBottom: 4,
  },
  inputGroup: {gap: 6},
  inputLabel: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
  },
  textInput: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.White,
  },

  /* Info box */
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

  /* Bottom */
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
