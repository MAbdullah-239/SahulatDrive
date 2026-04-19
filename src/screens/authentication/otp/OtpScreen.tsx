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
} from 'react-native';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';

interface OtpScreenProps {
  onBack?: () => void;
  onVerify?: (otp: string) => void;
  phoneNumber?: string;
}

const OtpScreen: React.FC<OtpScreenProps> = ({
  onBack,
  onVerify,
  phoneNumber = '+92 311 2345678',
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      onVerify?.(otpCode);
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
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* ── Title Area ── */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to you at{'\n'}
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
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
                maxLength={1}
                value={digit}
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
              otp.join('').length < 4 && styles.primaryBtnDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={otp.join('').length < 4}>
            <Text style={styles.primaryBtnText}>Verify →</Text>
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
  /* ── OTP Input Boxes ── */
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpBox: {
    width: 65,
    height: 65,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 28,
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
  /* ── Bottom Section ── */
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
