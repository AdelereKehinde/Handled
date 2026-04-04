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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';
import { PrimaryButton, DotProgress } from '../components/UI';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Overthinking\neverything?',
    subtitle: 'Decisions made calm today',
    icon: 'infinite',
    gradientTop: 'rgba(159,71,241,0.18)',
    gradientBottom: 'rgba(59,130,246,0.08)',
  },
  {
    id: '2',
    title: 'Let go of\nthe stress',
    subtitle: 'Guidance that keeps moving',
    icon: 'leaf-outline',
    gradientTop: 'rgba(59,130,246,0.14)',
    gradientBottom: 'rgba(159,71,241,0.08)',
  },
  {
    id: '3',
    title: 'Just tap\nand relax',
    subtitle: 'Smart choices for you',
    icon: 'sparkles-outline',
    gradientTop: 'rgba(159,71,241,0.2)',
    gradientBottom: 'rgba(16,185,129,0.08)',
  },
];

const SlideItem = ({ item }) => (
  <View style={styles.slide}>
    <View style={[styles.blobTop, { backgroundColor: item.gradientTop }]} />
    <View style={[styles.blobBottom, { backgroundColor: item.gradientBottom }]} />

    <View style={styles.iconWrap}>
      <Ionicons name={item.icon} size={36} color={Colors.glow} />
      <View style={styles.iconGlow} />
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
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
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
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          flatListRef.current?.scrollToOffset({ offset: width * index, animated: true });
        }}
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
          title={currentIndex === SLIDES.length - 1 ? "Let's Go" : 'Next'}
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
    color: Colors.textSoft,
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 160,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -60,
    left: -80,
  },
  blobBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: 120,
    right: -60,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(159,71,241,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(159,71,241,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  iconGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59,130,246,0.12)',
    zIndex: -1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
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
