import React, { useEffect, useRef } from 'react';
import { View, Image, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnimatedSplash({ onAnimationComplete }) {
  const { colors } = useTheme();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  // Pulsing animation for loading dots
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the splash animation sequence
    Animated.sequence([
      // Phase 1: Logo appears with scale and fade
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 2: Text slides up and fades in
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 3: Loading dots appear
      Animated.spring(dotScale, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      
      // Phase 4: Hold for a moment
      Animated.delay(800),
      
      // Phase 5: Fade out everything
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation complete, notify parent
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });

    // Start pulsing animation for dots
    const startPulsing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    // Start pulsing after dots appear
    const pulseTimer = setTimeout(startPulsing, 1200);
    
    return () => clearTimeout(pulseTimer);
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: colors.background, opacity: containerOpacity }
      ]}
    >
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={[styles.appName, { color: colors.text }]}>
          {APP_NAME}
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Security Companion
        </Text>
      </Animated.View>

      {/* Loading Dots */}
      <Animated.View
        style={[
          styles.dotsContainer,
          {
            transform: [{ scale: dotScale }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.dot, 
            { backgroundColor: colors.warning, transform: [{ scale: pulseAnim }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot, 
            { backgroundColor: colors.danger, marginHorizontal: 8 }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot, 
            { backgroundColor: colors.warning, transform: [{ scale: pulseAnim }] }
          ]} 
        />
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Powered by TechHive
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
