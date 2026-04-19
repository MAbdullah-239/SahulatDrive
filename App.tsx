import { View, StyleSheet } from 'react-native';
import React from 'react';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import Signup from './src/screens/authentication/signup/signup';
import OtpScreen from './src/screens/authentication/otp/OtpScreen';
import Home from './src/screens/main/home/home';

const App = () => {
  return (
    <View style={styles.container}>
      {/* <OnboardingScreen /> */}
      {/* <Signup /> */}
      {/* <OtpScreen /> */}
      <Home />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
