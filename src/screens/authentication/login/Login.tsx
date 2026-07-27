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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../navigation/authStackNavigation';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {loginUser, getCurrentUser} from '../../../requestHandler/api';
import {useAppDispatch} from '../../../redux/hooks';
import {setUser} from '../../../redux/slices/authSlice';
import {setVerified} from '../../../redux/slices/providerSlice';
import {registerDeviceToken} from '../../../utils/registerDeviceToken';
import {
  resetToProviderStack,
  resetToMainStack,
} from '../../../navigation/navigationRef';

interface LoginProps {
  onBack?: () => void;
  onSignUp?: () => void;
}

const Login: React.FC<LoginProps> = ({onBack, onSignUp}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      navigation.navigate(AuthStack.nestedScreens.Signup.name as never);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Missing details', 'Please enter your email/phone and password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginUser({login: identifier, password});
      // POST /session only confirms the cookie is set — GET /me is the
      // authoritative source for the full user record.
      const {data} = await getCurrentUser();

      dispatch(
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role as 'customer' | 'provider',
        }),
      );

      // Session cookie is now set — register this device's FCM token so the
      // backend can push job/order notifications to it.
      await registerDeviceToken();

      if (data.user.role === 'provider') {
        // is_verified is the sole authoritative approval signal (see
        // ProviderPendingApproval) — a provider logging back in before admin
        // approval must land back on the waiting screen, not skip straight
        // to the dashboard just because their role is 'provider'.
        const isVerified = Boolean(data.user.is_verified);
        dispatch(setVerified(isVerified));
        if (isVerified) {
          resetToProviderStack();
        } else {
          navigation.navigate(
            AuthStack.nestedScreens.ProviderPendingApproval.name as never,
          );
        }
      } else {
        resetToMainStack();
      }
    } catch (error) {
      Alert.alert(
        'Login failed',
        'Incorrect email/phone or password. Please try again.',
      );
    } finally {
      setSubmitting(false);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue to Sahulat Drive</Text>
          </View>

          {/* ── Form Fields ── */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ahmed@email.com or +92311..."
                  placeholderTextColor={Colors.Grey}
                  autoCapitalize="none"
                  selectionColor="#E8490F"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
            </View>

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

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate(
                  AuthStack.nestedScreens.ForgotPassword.name as never,
                )
              }>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* ── Action Button ── */}
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.White} />
            ) : (
              <Text style={styles.primaryBtnText}>Log In →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

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
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 14,
    color: '#E8490F',
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
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  signUpLink: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#E8490F',
  },
});
