import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";

interface CarouselIntroScreenProps {
  onSkip: () => void;
  onDone: () => void;
}

const { width, height: screenHeight } = Dimensions.get("window");

export default function CarouselIntroScreen({
  onSkip,
  onDone,
}: CarouselIntroScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    {
      key: "first",
      image: require("../../../assets/caroussel/carousel_first.png"),
      text: "Keep a track record of your activities !",
    },
    {
      key: "second",
      image: require("../../../assets/caroussel/carousel_second.png"),
      text: "Train and get better by performing specific exercises !",
    },
    {
      key: "third",
      image: require("../../../assets/caroussel/carousel_third.png"),
      text: "Train based on your level and improve along the way !",
    },
    {
      key: "fourth",
      image: require("../../../assets/caroussel/carousel_fourth.png"),
      text: "Test yourself against benchmarks !",
    },
  ];

  const handleNext = () => {
    if (page < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
      setPage((p) => p + 1);
    } else {
      onDone();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newPage = Math.round(e.nativeEvent.contentOffset.x / width);
          setPage(newPage);
        }}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={{ width, paddingHorizontal: 24 }}>
            <View style={styles.imageWrap}>
              <View style={styles.phoneFrame}>
                <View style={styles.notch} />
                <View style={styles.screenArea}>
                  <Image
                    source={slide.image}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {page < slides.length - 1 ? "Next" : "Get started"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const IMAGE_HEIGHT = Math.round(screenHeight * 0.7);
const IMAGE_MAX_WIDTH = Math.min(width - 50, 420);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 50,
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    padding: 8,
  },
  skipText: {
    color: Colors.gray,
    fontSize: 14,
  },
  imageWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: IMAGE_HEIGHT,
    marginTop: 0,
    marginBottom: 12,
  },
  screenshotCard: {
    width: IMAGE_MAX_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    backgroundColor: "#0f0f0f",
    borderWidth: 2,
    borderColor: Colors.themeColor,
    overflow: "hidden",
    // iOS shadow
    shadowColor: Colors.themeColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    // Android shadow
    elevation: 10,
  },
  phoneFrame: {
    width: IMAGE_MAX_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 36,
    backgroundColor: "#0a0a0a",
    borderWidth: 3,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 12,
  },
  notch: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 110,
    height: 24,
    backgroundColor: "#0a0a0a",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 2,
  },
  screenArea: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 28, // below notch
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  text: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 12,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.themeColor,
    width: 16,
  },
  nextButton: {
    backgroundColor: Colors.themeColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
