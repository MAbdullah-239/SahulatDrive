import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStack} from '../../../constants/stack/authStack/authStack';
import {verifyRegistrationOtp} from '../../../requestHandler/api';
import {useAppDispatch} from '../../../redux/hooks';
import {setUser} from '../../../redux/slices/authSlice';
import {registerDeviceToken} from '../../../utils/registerDeviceToken';

const OTP_LENGTH = 6;

interface OtpScreenProps {
  onBack?: () => void;
  onVerify?: (otp: string) => void;
  phoneNumber?: string;
}

const OtpScreen: React.FC<OtpScreenProps> = ({
  onBack,
  onVerify,
  phoneNumber,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const displayPhone = phoneNumber || route.params?.phone || '+92 311 2345678';
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    // SMS autofill (iOS QuickType strip / Android sms-otp) delivers the full
    // code in one shot to whichever box is focused, not one digit at a time —
    // detect that and spread it across all boxes instead of only keeping the
    // last character.
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = new Array(OTP_LENGTH).fill('');
      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const lastFilledIndex = Math.min(digits.length, OTP_LENGTH) - 1;
      inputs.current[lastFilledIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      return;
    }
    if (onVerify) {
      onVerify(otpCode);
      return;
    }

    setVerifying(true);
    try {
      const {data} = await verifyRegistrationOtp({
        phone: route.params?.phone,
        otp_code: otpCode,
      });
      dispatch(
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          isVerified: data.user.otp_verified,
        }),
      );

      // Session cookie is now set by the verify_registration_otp response —
      // register this device's FCM token so the backend can push job
      // notifications to it.
      await registerDeviceToken();

      if (data.user.role === 'provider') {
        // Provider → go to service selection (still within AuthStack)
        navigation.navigate(
          AuthStack.nestedScreens.ProviderSelectServices.name as never,
        );
      } else {
        // Customer → jump to main app
        navigation.reset({
          index: 0,
          routes: [{name: 'MainStack' as never}],
        });
      }
    } catch (error) {
      Alert.alert(
        'Invalid code',
        'That OTP is incorrect or has expired. Please try again.',
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigation.goBack();
                }
              }}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* ── Title Area ── */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
              Enter the {OTP_LENGTH}-digit code sent to you at{'\n'}
              <Text style={styles.phoneNumber}>{displayPhone}</Text>
            </Text>
          </View>

          {/* ── OTP Input Boxes ── */}
          <View style={styles.otpBoxesContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                ]}
                placeholder="-"
                placeholderTextColor={Colors.Grey}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete={index === 0 ? 'sms-otp' : 'off'}
                importantForAutofill={index === 0 ? 'yes' : 'no'}
                maxLength={OTP_LENGTH}
                value={digit}
                editable={!verifying}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                ref={input => {
                  inputs.current[index] = input;
                }}
                selectionColor="#E8490F"
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Verify Button (Bottom) ── */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (otp.join('').length < OTP_LENGTH || verifying) &&
                styles.primaryBtnDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={otp.join('').length < OTP_LENGTH || verifying}>
            {verifying ? (
              <ActivityIndicator color={Colors.White} />
            ) : (
              <Text style={styles.primaryBtnText}>Verify →</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  /* ── Header ── */
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.White,
    fontSize: 20,
    lineHeight: 22,
  },
  /* ── Title Area ── */
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 32,
    color: Colors.White,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.GreyText,
    lineHeight: 22,
  },
  phoneNumber: {
    fontFamily: FontFamily.UrbanistBold,
    color: Colors.White,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  otpBox: {
    width: 46,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 22,
    color: Colors.White,
    textAlign: 'center',
  },
  otpBoxEmpty: {
    borderColor: 'transparent',
  },
  otpBoxFilled: {
    borderColor: '#E8490F',
    backgroundColor: 'rgba(232,73,15,0.08)',
  },
  /* ── Resend ── */
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  resendLink: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#E8490F',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
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
    backgroundColor: 'rgba(232,73,15,0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    letterSpacing: 0.3,
  },
});
