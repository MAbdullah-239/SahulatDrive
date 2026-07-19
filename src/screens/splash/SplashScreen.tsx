import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, {Path, Ellipse, Circle, G, Rect} from 'react-native-svg';
import {FontFamily} from '../../generalStyles/generalFonts';

const {width, height} = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

/* ─────────────────────────────────────────────────────────────────
   Pixel-perfect side-profile car icon matching the app icon exactly
───────────────────────────────────────────────────────────────── */
const CarSVG: React.FC = () => (
  <Svg width="90" height="60" viewBox="0 0 90 60">
    {/* Ground shadow */}
    <Ellipse cx="45" cy="56" rx="34" ry="4" fill="rgba(0,0,0,0.18)" />

    {/* Main car body */}
    <Path
      d={`
        M 12 42
        Q 10 42 10 40
        L 10 36
        Q 10 33 13 33
        L 17 33
        Q 19 28 24 25
        L 32 23
        Q 35 16 42 14
        L 58 14
        Q 66 14 70 20
        L 74 23
        L 77 23
        Q 80 23 80 26
        L 80 36
        Q 80 40 77 40
        L 76 40
        Q 75 33 68 33
        Q 61 33 60 40
        L 30 40
        Q 29 33 22 33
        Q 15 33 14 40
        L 12 42 Z
      `}
      fill="#FFFFFF"
      stroke="#1A1A1A"
      strokeWidth="1.2"
    />

    {/* Front windshield pane */}
    <Path
      d={`M 58 15 Q 65 15 69 21 L 71 23 L 56 23 L 56 16 Z`}
      fill="#5DCFDC"
      stroke="#1A1A1A"
      strokeWidth="0.8"
    />
    {/* Rear windshield pane */}
    <Path
      d={`M 42 15 L 54 15 L 54 23 L 32 23 Q 35 16 42 15 Z`}
      fill="#5DCFDC"
      stroke="#1A1A1A"
      strokeWidth="0.8"
    />
    {/* B-pillar */}
    <Rect x="54" y="14" width="2.5" height="9.5" fill="#1A1A1A" rx="1" />

    {/* Door crease */}
    <Path
      d="M 18 36 Q 45 38 75 35"
      fill="none"
      stroke="#E0E0E0"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Yellow fuel cap */}
    <Circle cx="74" cy="30" r="3" fill="#F5C518" stroke="#D4A000" strokeWidth="0.6" />

    {/* Front wheel */}
    <G>
      <Circle cx="22" cy="43" r="10" fill="#1C1C1E" />
      <Circle cx="22" cy="43" r="5.5" fill="#8E8E93" />
      <Circle cx="22" cy="43" r="2.5" fill="#B0B0B5" />
    </G>

    {/* Rear wheel */}
    <G>
      <Circle cx="68" cy="43" r="10" fill="#1C1C1E" />
      <Circle cx="68" cy="43" r="5.5" fill="#8E8E93" />
      <Circle cx="68" cy="43" r="2.5" fill="#B0B0B5" />
    </G>
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
        {/* App icon card */}
        <Animated.View style={[
          styles.iconShadow,
          {opacity: logoOpacity, transform: [{scale: logoScale}]},
        ]}>
          <View style={styles.iconCard}>
            <CarSVG />
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View style={[
          styles.textWrap,
          {opacity: textOpacity, transform: [{translateY: textSlide}]},
        ]}>
          <Text style={styles.nameWhite}>Sahulat</Text>
          <Text style={styles.nameOrange}>Drive</Text>
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
  iconCard: {
    width: 116,
    height: 116,
    borderRadius: 30,
    backgroundColor: '#E8490F',
    alignItems: 'center',
    justifyContent: 'center',
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
});
