import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FarmerAppLogo } from '../../components/FarmerAppLogo';
import { COLORS, RADIUS, SPACING } from '../../theme';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animation values
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(14)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence orchestration: Total ~2.0s
    Animated.sequence([
      // Phase 1: Background appears
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Phase 2 & 3: Logo scale + glow ring
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1.15,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: App name slides up and fades in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Phase 5: Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Phase 6: Loading indicator appears & progresses
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false, // width animation
        }),
      ]),
    ]).start(() => {
      // Phase 7: Transition to auth check
      setTimeout(() => {
        onFinish();
      }, 150);
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.55],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#022c22" />
      <Animated.View style={{ flex: 1, width: '100%', opacity: bgOpacity }}>
        <LinearGradient
          colors={['#022c22', '#064e3b', '#043427', '#011c15']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
        {/* Top Government Watermark Tag */}
        <View style={styles.govTagContainer}>
          <Text style={styles.govTagDept}>
            MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
          </Text>
          <Text style={styles.govTagSub}>
            Department of Consumer Affairs (DoCA) • Smart India Initiative
          </Text>
        </View>

        {/* Central Logo & Glow Arena */}
        <View style={styles.centerContainer}>
          {/* Subtle Outer Golden / Emerald Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Logo with Spring Scale */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <FarmerAppLogo size={106} />
          </Animated.View>

          {/* App Title & Vernacular Tag */}
          <Animated.View
            style={[
              styles.titleWrapper,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.appTitle}>KISAN e-PROCURE</Text>
            <Text style={styles.hindiTitle}>किसान ई-प्रोक्योर</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={{ opacity: taglineOpacity }}>
            <Text style={styles.tagline}>Smart Procurement for Every Farmer</Text>
            <Text style={styles.subTagline}>
              पारदर्शक खरेदी • वेळेची बचत • थेट बँक खात्यात हमीभाव
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Loading Indicator */}
        <Animated.View style={[styles.bottomContainer, { opacity: loaderOpacity }]}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.loadingStatusText}>
            Connecting to APMC Mandi Gateway...
          </Text>
        </Animated.View>
      </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022c22',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  govTagContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  govTagDept: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  govTagSub: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 3,
    letterSpacing: 0.3,
    textAlign: 'center',
    fontWeight: '500',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
  },
  glowRing: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    top: -20,
  },
  logoWrapper: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  hindiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FDE047',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  subTagline: {
    fontSize: 11,
    color: '#86EFAC',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  progressBarTrack: {
    width: width * 0.55,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: RADIUS.full,
  },
  loadingStatusText: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: SPACING.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
