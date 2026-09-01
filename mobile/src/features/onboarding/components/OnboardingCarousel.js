import React, { useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { APP_NAME } from '../../../utils/constants';
import { typography } from '../../../utils/typography';
import { getOnboardingSlides } from '../constants/onboardingSlides';
import OnboardingSlide from './OnboardingSlide';

export default function OnboardingCarousel({ onComplete }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const slides = useMemo(() => getOnboardingSlides(Platform.OS), []);
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const toneColors = {
    accent: colors.accent,
    primary: colors.primary,
    warning: colors.warning,
    secondary: colors.secondary,
    success: '#16a34a',
  };

  const moveToSlide = (nextIndex) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
    listRef.current?.scrollToOffset({ offset: boundedIndex * width, animated: true });
    setCurrentIndex(boundedIndex);
    AccessibilityInfo.announceForAccessibility(
      `Step ${boundedIndex + 1} of ${slides.length}: ${slides[boundedIndex].title}`,
    );
  };

  const handlePrimaryAction = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }
    moveToSlide(currentIndex + 1);
  };

  const handleMomentumScrollEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== currentIndex && slides[nextIndex]) {
      setCurrentIndex(nextIndex);
      AccessibilityInfo.announceForAccessibility(
        `Step ${nextIndex + 1} of ${slides.length}: ${slides[nextIndex].title}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../../assets/icon.png')} style={styles.logo} />
          <Text style={[styles.brandName, { color: colors.text }]}>{APP_NAME}</Text>
        </View>
        <View style={[styles.stepCounterBadge, { backgroundColor: colors.neuInset }]}>
          <Text style={[styles.progressCount, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {slides.length}
          </Text>
        </View>
      </View>

      <View style={styles.progressArea}>
        <View style={[styles.progressTrack, { backgroundColor: colors.neuInset }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / slides.length) * 100}%`,
                backgroundColor: toneColors[slides[currentIndex].tone],
              },
            ]}
          />
        </View>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            slide={item}
            width={width}
            colors={colors}
            accent={toneColors[item.tone]}
            isLastSlide={index === slides.length - 1}
            onSkip={onComplete}
          />
        )}
      />

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.pagination} accessibilityLabel={`Step ${currentIndex + 1} of ${slides.length}`}>
          {slides.map((slide, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 20, 6],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: toneColors[slide.tone],
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { borderColor: colors.border, opacity: isFirstSlide ? 0.35 : 1 },
            ]}
            onPress={() => moveToSlide(currentIndex - 1)}
            disabled={isFirstSlide}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel="Previous onboarding step"
          >
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: toneColors[slides[currentIndex].tone] },
            ]}
            onPress={handlePrimaryAction}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Pair this device' : 'Next onboarding step'}
          >
            <Text style={styles.nextText}>{isLastSlide ? 'Pair Device' : 'Next'}</Text>
            <Ionicons name={isLastSlide ? 'link' : 'arrow-forward'} size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 46, paddingHorizontal: 20, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 30, height: 30, borderRadius: 8 },
  brandName: { ...typography.heading, fontSize: 16, lineHeight: 18 },
  stepCounterBadge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  progressCount: { ...typography.bodyBold, fontSize: 10.5 },
  progressArea: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 4 },
  progressTrack: { height: 3.5, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  pagination: { height: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginBottom: 8 },
  dot: { height: 6, borderRadius: 3 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { height: 42, paddingHorizontal: 16, borderRadius: 11, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  backText: { ...typography.bodyBold, fontSize: 12.5 },
  nextButton: { height: 42, paddingHorizontal: 20, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 96 },
  nextText: { ...typography.bodyBold, color: '#fff', fontSize: 13 },
});
