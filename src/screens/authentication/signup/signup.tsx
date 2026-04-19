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

type Role = 'Driver' | 'Mechanic' | 'Workshop';

const roles: {id: Role; title: string; emoji: string}[] = [
  {id: 'Driver', title: 'Driver', emoji: '🚗'},
  {id: 'Mechanic', title: 'Mechanic', emoji: '🔧'},
  {id: 'Workshop', title: 'Workshop', emoji: '🏭'},
];

interface SignupProps {
  onBack?: () => void;
  onContinue?: () => void;
}

const Signup: React.FC<SignupProps> = ({onBack, onContinue}) => {
  const [selectedRole, setSelectedRole] = useState<Role>('Driver');
  const [showPassword, setShowPassword] = useState(false);

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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* ── Title Area ── */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands of drivers across Pakistan
            </Text>
          </View>

          {/* ── Role Selector ── */}
          <View style={styles.roleContainer}>
            {roles.map(role => {
              const isSelected = selectedRole === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    isSelected ? styles.roleCardActive : styles.roleCardInactive,
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                  activeOpacity={0.8}>
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                  <Text
                    style={[
                      styles.roleText,
                      isSelected ? styles.roleTextActive : styles.roleTextInactive,
                    ]}>
                    {role.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Action Button ── */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onContinue}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue</Text>
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
  /* ── Header ── */
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
  /* ── Role Selector ── */
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  roleCard: {
    flex: 1,
    height: 90,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  roleCardActive: {
    borderColor: '#E8490F',
    backgroundColor: 'rgba(232,73,15,0.08)',
  },
  roleCardInactive: {
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 13,
  },
  roleTextActive: {
    color: '#E8490F',
  },
  roleTextInactive: {
    color: Colors.GreyText,
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
