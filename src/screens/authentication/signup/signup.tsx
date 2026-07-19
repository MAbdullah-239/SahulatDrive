import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../navigation/authStackNavigation';
import {AuthStack} from '../../../constants/stack/authStack/authStack';

// As per backend document:
// ONE role = provider. Customer is also a role.
// "Do not create separate user roles such as mechanic or tow_driver."
type AccountRole = 'customer' | 'provider';

const accountTypes: {
  id: AccountRole;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    id: 'customer',
    title: 'Customer',
    subtitle: 'Request roadside help',
    icon: '🚗',
  },
  {
    id: 'provider',
    title: 'Provider',
    subtitle: 'Offer roadside services',
    icon: '🔧',
  },
];

interface SignupProps {
  onBack?: () => void;
  onContinue?: (role: AccountRole) => void;
}

const Signup: React.FC<SignupProps> = ({onBack, onContinue}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedRole, setSelectedRole] = useState<AccountRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedRole);
      return;
    }
    // Navigate to OTP first; after OTP → branch by role
    navigation.navigate(AuthStack.nestedScreens.VerifyOTP.name, {
      role: selectedRole,
    } as never);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* ── Header ── */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* ── Title Area ── */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands across Pakistan</Text>
          </View>

          {/* ── Account Type Selector ── */}
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.roleContainer}>
            {accountTypes.map(type => {
              const isSelected = selectedRole === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.roleCard,
                    isSelected
                      ? styles.roleCardActive
                      : styles.roleCardInactive,
                  ]}
                  onPress={() => setSelectedRole(type.id)}
                  activeOpacity={0.8}>
                  <Text style={styles.roleEmoji}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.roleText,
                      isSelected
                        ? styles.roleTextActive
                        : styles.roleTextInactive,
                    ]}>
                    {type.title}
                  </Text>
                  <Text
                    style={[
                      styles.roleSubtext,
                      isSelected
                        ? styles.roleSubtextActive
                        : styles.roleSubtextInactive,
                    ]}>
                    {type.subtitle}
                  </Text>
                  {isSelected && <View style={styles.checkDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Provider note */}
          {selectedRole === 'provider' && (
            <View style={styles.noteBox}>
              <Text style={styles.noteIcon}>ℹ️</Text>
              <Text style={styles.noteText}>
                As a provider, you'll select your service categories (towing,
                battery jump, fuel delivery, etc.) in the next step.
              </Text>
            </View>
          )}

          {/* ── Form Fields ── */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ahmed Raza"
                  placeholderTextColor={Colors.Grey}
                  selectionColor="#E8490F"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.phonePrefix}>+92</Text>
                <View style={styles.separator} />
                <TextInput
                  style={styles.inputPhone}
                  placeholder="311 2345678"
                  placeholderTextColor={Colors.Grey}
                  keyboardType="phone-pad"
                  selectionColor="#E8490F"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ahmed@email.com"
                  placeholderTextColor={Colors.Grey}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor="#E8490F"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.Grey}
                  secureTextEntry={!showPassword}
                  selectionColor="#E8490F"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Action Button ── */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleContinue}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>
              Continue {selectedRole === 'provider' ? '→ Select Services' : '→'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  backIcon: {
    color: Colors.White,
    fontSize: 20,
    lineHeight: 22,
  },
  /* ── Title Area ── */
  titleContainer: {
    marginBottom: 28,
  },
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 32,
    color: Colors.White,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.GreyText,
  },
  sectionLabel: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: Colors.GreyText,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  /* ── Role Selector ── */
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  roleCard: {
    flex: 1,
    minHeight: 110,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 16,
    position: 'relative',
  },
  roleCardActive: {
    borderColor: '#E8490F',
    backgroundColor: 'rgba(232,73,15,0.08)',
  },
  roleCardInactive: {
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roleEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  roleText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    marginBottom: 4,
  },
  roleTextActive: {
    color: '#E8490F',
  },
  roleTextInactive: {
    color: Colors.White,
  },
  roleSubtext: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    textAlign: 'center',
  },
  roleSubtextActive: {
    color: 'rgba(232,73,15,0.8)',
  },
  roleSubtextInactive: {
    color: Colors.GreyText,
  },
  checkDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8490F',
  },
  /* ── Provider Note ── */
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  noteIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
    lineHeight: 20,
  },
  /* ── Form Fields ── */
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.White,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.White,
  },
  phonePrefix: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.GreyText,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 12,
  },
  inputPhone: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.White,
  },
  inputPassword: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.White,
  },
  eyeIconContainer: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  /* ── Action Button ── */
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
  primaryBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    letterSpacing: 0.3,
  },
});
