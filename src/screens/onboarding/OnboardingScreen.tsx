import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../generalStyles/colors';
import { FontFamily } from '../../generalStyles/generalFonts';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '🛣️',
    title: 'Help is always\none tap away.',
    subtitle:
      'Real-time roadside assistance,\nAI diagnostics, and workshop booking\n— built for Pakistan.',
  },
  {
    id: '2',
    emoji: '🔧',
    title: 'Smart AI\nDiagnostics.',
    subtitle:
      'Get instant vehicle health insights\nand predictive maintenance reminders\n— powered by AI.',
  },
  {
    id: '3',
    emoji: '🏪',
    title: 'Book a Workshop\nIn Seconds.',
    subtitle:
      'Find trusted mechanics near you,\ncompare prices, and book a service\n— all in one place.',
  },
];

interface OnboardingScreenProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      onGetStarted?.();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Emoji illustration */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Headline */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgColor} />

      <View style={styles.container}>

        {/* ── Top Brand Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🚗</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Sahulat</Text>
            <Text style={styles.brandAccent}>Drive</Text>
          </View>
        </View>

        {/* ── Slide content ── */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        {/* ── Bottom section ── */}
        <View style={styles.bottomSection}>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Get Started button */}
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleNext}
            activeOpacity={0.85}>
            <Text style={styles.getStartedText}>
              {activeIndex < slides.length - 1
                ? 'Next →'
                : 'Get Started →'}
            </Text>
          </TouchableOpacity>

          {/* Sign In link */}
          <View style={styles.signInRow}>
            <Text style={styles.signInLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 14,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#E8490F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: Colors.White,
    lineHeight: 28,
  },
  brandAccent: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 26,
    color: '#E8490F',
    lineHeight: 28,
  },

  /* ── Slide ── */
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(232,73,15,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(232,73,15,0.18)',
  },
  emoji: {
    fontSize: 68,
  },
  title: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 32,
    color: Colors.White,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 15,
    color: Colors.GreyText,
    textAlign: 'center',
    lineHeight: 24,
  },

  /* ── Bottom ── */
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 18,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#E8490F',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  getStartedBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#E8490F',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8490F',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  getStartedText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 17,
    color: Colors.White,
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInLabel: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  signInLink: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 14,
    color: '#E8490F',
  },
});
