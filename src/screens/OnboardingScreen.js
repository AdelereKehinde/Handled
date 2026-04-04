import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
import { PrimaryButton, DotProgress } from '../components/UI';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌀',
    title: 'Overthinking\neverything?',
    subtitle: 'Handled helps you decide —\ncalm, simple, instant.',
    gradientTop: 'rgba(108,92,231,0.18)',
    gradientBottom: 'rgba(0,207,255,0.07)',
  },
  {
    id: '2',
    emoji: '🌿',
    title: 'Let go of\nthe stress',
    subtitle: 'We guide your choices so\nyou don't have to overthink.',
    gradientTop: 'rgba(0,207,255,0.14)',
    gradientBottom: 'rgba(108,92,231,0.08)',
  },
  {
    id: '3',
    emoji: '✨',
    title: 'Just tap\nand relax',
    subtitle: 'From food to life decisions —\nwe've got you.',
    gradientTop: 'rgba(108,92,231,0.2)',
    gradientBottom: 'rgba(0,214,143,0.07)',
  },
];

const SlideItem = ({ item }) => (
  <View style={styles.slide}>
    <View style={[styles.blobTop, { backgroundColor: item.gradientTop }]} />
    <View style={[styles.blobBottom, { backgroundColor: item.gradientBottom }]} />

    <View style={styles.emojiRing}>
      <Text style={styles.emoji}>{item.emoji}</Text>
    </View>

    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.subtitle}</Text>
  </View>
);

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('AuthEntry');
    }
  };

  const skip = () => navigation.replace('AuthEntry');

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <SlideItem item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <DotProgress total={SLIDES.length} current={currentIndex} />

        <PrimaryButton
          title={currentIndex === SLIDES.length - 1 ? "Let's Go 🌸" : 'Next'}
          onPress={goNext}
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: Colors.whiteAlpha60,
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 160,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -60,
    left: -80,
  },
  blobBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 120,
    right: -60,
  },
  emojiRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.whiteAlpha60,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    gap: 20,
    alignItems: 'center',
  },
  nextBtn: {
    width: '100%',
  },
});
