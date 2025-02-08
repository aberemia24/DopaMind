import React, { useRef, useState, useEffect } from 'react';
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
  const slidesRef = useRef<FlatList<Slide>>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      // Revenim la primul slide
      slidesRef.current?.scrollToIndex({
        index: 0,
        animated: true
      });
    }
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
        <Image 
          source={item.image} 
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Text style={styles.description}>{t(item.descriptionKey)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === index ? '#6495ED' : '#E0E0E0',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    flex: 0.7,
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 10,
    color: '#2E2E2E',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
});
