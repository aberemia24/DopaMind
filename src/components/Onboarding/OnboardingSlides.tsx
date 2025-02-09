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
import { ONBOARDING_TRANSLATIONS } from '../../i18n/keys';

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
    titleKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE1.TITLE,
    descriptionKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE1.DESCRIPTION,
    image: require('./Multitasking-bro.png'),
  },
  {
    id: '2',
    titleKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE2.TITLE,
    descriptionKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE2.DESCRIPTION,
    image: require('./Task-bro.png'),
  },
  {
    id: '3',
    titleKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE3.TITLE,
    descriptionKey: ONBOARDING_TRANSLATIONS.SLIDES.SLIDE3.DESCRIPTION,
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

  const renderItem: ListRenderItem<Slide> = ({ item, index }) => {
    return (
      <View 
        style={styles.slide}
        accessibilityRole="tab"
        accessibilityLabel={t(ONBOARDING_TRANSLATIONS.ACCESSIBILITY.SLIDE)}
        accessibilityState={{ selected: index === currentIndex }}
      >
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={t(item.titleKey)}
        />
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
      accessibilityLabel={t(ONBOARDING_TRANSLATIONS.ACCESSIBILITY.SLIDESHOW)}
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
        accessibilityLabel={t(ONBOARDING_TRANSLATIONS.ACCESSIBILITY.PAGINATION)}
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
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: i === currentIndex }}
            />
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
