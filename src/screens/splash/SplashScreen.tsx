import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, {Path, Ellipse, Circle, Rect, Defs, LinearGradient, Stop} from 'react-native-svg';
import {FontFamily} from '../../generalStyles/generalFonts';

const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

/* ─────────────────────────────────────────────────────────────────
   App icon (wrench-in-pin logo) — matches icon.svg exactly
───────────────────────────────────────────────────────────────── */
const LogoSVG: React.FC<{size: number}> = ({size}) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Defs>
      <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF8A50" />
        <Stop offset="55%" stopColor="#F0592A" />
        <Stop offset="100%" stopColor="#D6401A" />
      </LinearGradient>
      <LinearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>

    <Rect x={0} y={0} width={1024} height={1024} rx={224} ry={224} fill="url(#bgGrad)" />
    <Rect x={0} y={0} width={1024} height={512} rx={224} ry={224} fill="url(#glossGrad)" />

    <Path
      d="M512,838 C512,838 288,610 288,432 A224,224 0 1,1 736,432 C736,610 512,838 512,838 Z"
      fill="#FFFFFF"
    />
    <Ellipse cx={512} cy={856} rx={86} ry={18} fill="#8A1F00" opacity={0.16} />

    <Path
      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
      fill="#E8491D"
      transform="translate(374,294) scale(11.5)"
    />

    <Circle cx={668} cy={330} r={34} fill="#1FA451" />
    <Circle cx={668} cy={330} r={34} fill="none" stroke="#FFFFFF" strokeWidth={10} />
  </Svg>
);

/* ─── Main Splash ────────────────────────────────────────────── */
const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const logoScale   = useRef(new Animated.Value(0.55)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide   = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(glowOpacity, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.parallel([
        Animated.spring(logoScale, {toValue: 1, friction: 5, tension: 90, useNativeDriver: true}),
        Animated.timing(logoOpacity, {toValue: 1, duration: 350, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {toValue: 1, duration: 320, useNativeDriver: true}),
        Animated.timing(textSlide,   {toValue: 0, duration: 320, useNativeDriver: true}),
      ]),
      Animated.delay(1100),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" translucent />

      {/* Warm radial glow — 3 layered ovals */}
      <Animated.View style={[styles.glow1, {opacity: glowOpacity}]} />
      <Animated.View style={[styles.glow2, {opacity: glowOpacity}]} />
      <Animated.View style={[styles.glow3, {opacity: glowOpacity}]} />

      <View style={styles.center}>
        {/* App icon */}
        <Animated.View style={[
          styles.iconShadow,
          {opacity: logoOpacity, transform: [{scale: logoScale}]},
        ]}>
          <LogoSVG size={116} />
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={[
          styles.textWrap,
          {opacity: textOpacity, transform: [{translateY: textSlide}]},
        ]}>
          <Text style={styles.nameWhite}>Sahulat</Text>
          <Text style={styles.nameOrange}>Drive</Text>
          <Text style={styles.tagline}>Roadside Assistance, On Demand</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow1: {
    position: 'absolute',
    width: width,
    height: height * 0.6,
    top: height * 0.05,
    alignSelf: 'center',
    borderRadius: width / 2,
    backgroundColor: 'rgba(150,55,5,0.12)',
  },
  glow2: {
    position: 'absolute',
    width: width * 0.65,
    height: height * 0.38,
    top: height * 0.14,
    alignSelf: 'center',
    borderRadius: width * 0.325,
    backgroundColor: 'rgba(200,75,10,0.17)',
  },
  glow3: {
    position: 'absolute',
    width: width * 0.38,
    height: height * 0.2,
    top: height * 0.21,
    alignSelf: 'center',
    borderRadius: width * 0.19,
    backgroundColor: 'rgba(230,90,15,0.2)',
  },
  center: {
    alignItems: 'center',
  },
  iconShadow: {
    marginBottom: 26,
    shadowColor: '#E8490F',
    shadowOpacity: 0.6,
    shadowRadius: 36,
    shadowOffset: {width: 0, height: 10},
    elevation: 18,
  },
  textWrap: {alignItems: 'center'},
  nameWhite: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    lineHeight: 44,
  },
  nameOrange: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 38,
    color: '#E8490F',
    letterSpacing: 0.3,
    lineHeight: 42,
  },
  tagline: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: '#8A8A8E',
    letterSpacing: 0.4,
    marginTop: 10,
  },
});
