import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  FlatList,
  ViewToken,
  ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../constants/accessibility';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Slide>);

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: any;
}

const slides: Slide[] = [
  {
    id: '1',
    titleKey: 'onboarding.slides.slide1.title',
    descriptionKey: 'onboarding.slides.slide1.description',
    image: require('./Multitasking-bro.png'),
  },
  {
    id: '2',
    titleKey: 'onboarding.slides.slide2.title',
    descriptionKey: 'onboarding.slides.slide2.description',
    image: require('./Task-bro.png'),
  },
  {
    id: '3',
    titleKey: 'onboarding.slides.slide3.title',
    descriptionKey: 'onboarding.slides.slide3.description',
    image: require('./Mental health-bro.png'),
  },
];

export function OnboardingSlides() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(Number(viewableItems[0].index));
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const scrollToNextSlide = () => {
    const nextIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    scrollTo(nextIndex);
  };

  useEffect(() => {
    // Pornim auto-scroll
    autoScrollTimer.current = setInterval(scrollToNextSlide, 3000);

    // Cleanup la unmount
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex]);

  const handleMomentumScrollEnd = () => {
    // Resetăm timer-ul când utilizatorul face scroll manual
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    autoScrollTimer.current = setInterval(scrollToNextSlide, 3000);
  };

  const renderItem: ListRenderItem<Slide> = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text 
            style={styles.title}
            accessibilityRole="header"
          >
            {t(item.titleKey)}
          </Text>
          <Text 
            style={styles.description}
            accessibilityRole="text"
          >
            {t(item.descriptionKey)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="tablist"
      accessibilityLabel={t('onboarding.accessibility.slideshow')}
    >
      <AnimatedFlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        accessibilityRole="none"
      />

      <View 
        style={styles.pagination}
        accessibilityRole="tablist"
        accessibilityLabel={t('onboarding.accessibility.pagination')}
      >
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={i}
              onPress={() => scrollTo(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: currentIndex === i }}
              accessibilityLabel={t('onboarding.accessibility.pageIndicator', {
                current: i + 1,
                total: slides.length
              })}
            >
              <Animated.View
                style={[
                  styles.dot,
                  { width: dotWidth, opacity }
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
  },
  image: {
    flex: 0.7,
    width: '80%',
  },
  textContainer: {
    flex: 0.3,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  description: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
  },
  pagination: {
    flexDirection: 'row',
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: ACCESSIBILITY.SPACING.MD,
  },
  dot: {
    height: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.XS,
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
  },
});
