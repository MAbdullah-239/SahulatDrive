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
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../navigation/authStackNavigation';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {forgotPassword, resetPassword} from '../../../requestHandler/api';

const ResetPasswordScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const login: string | undefined = route.params?.login;

  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Missing code', 'Enter the code we sent you.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Please re-enter your new password.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({otp_code: otpCode.trim(), new_password: newPassword});
      Alert.alert('Password reset', 'You can now log in with your new password.', [
        {
          text: 'Log In',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{name: AuthStack.nestedScreens.Login.name as never}],
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Could not reset password',
        error?.response?.data?.error ?? 'That code is incorrect or has expired.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!login || resending) return;
    setResending(true);
    try {
      await forgotPassword({login});
      Alert.alert('Code sent', 'A new code is on its way.');
    } catch (error: any) {
      Alert.alert('Could not resend', 'Please try again in a moment.');
    } finally {
      setResending(false);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the code {login ? `sent to ${login}` : 'we sent you'} along
              with your new password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reset Code</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={Colors.Grey}
                  keyboardType="number-pad"
                  selectionColor="#E8490F"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  editable={!submitting}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.Grey}
                  secureTextEntry={!showPassword}
                  selectionColor="#E8490F"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!submitting}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.Grey}
                  secureTextEntry={!showPassword}
                  selectionColor="#E8490F"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!submitting}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.White} />
            ) : (
              <Text style={styles.primaryBtnText}>Reset Password →</Text>
            )}
          </TouchableOpacity>

          {login ? (
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't get a code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color="#E8490F" />
                ) : (
                  <Text style={styles.resendLink}>Resend</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
  titleContainer: {
    marginBottom: 32,
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
    lineHeight: 22,
  },
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
    marginBottom: 20,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  resendLink: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#E8490F',
  },
});
