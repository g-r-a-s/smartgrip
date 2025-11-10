import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import ImageOverlayCard from "../components/ImageOverlayCard";
import Colors from "../constants/colors";

interface ChallengeCard {
  id: string;
  title: string;
  description: string;
  image: ReturnType<typeof require>;
  onPress: () => void;
}

export default function ChallengesScreen() {
  const navigation = useNavigation();

  const handleAttiaHangPress = () => {
    (navigation as any).navigate("AttiaChallenge", { challengeType: "hang" });
  };

  const handleAttiaFarmerWalkPress = () => {
    (navigation as any).navigate("AttiaChallenge", {
      challengeType: "farmer-walk",
    });
  };

  const challenges: ChallengeCard[] = [
    {
      id: "attia-hang",
      title: "Attia Hang Challenge",
      description:
        "Hang for 2 minutes (men) or 90 seconds (women) to pass this benchmark challenge.",
      image: require("../../assets/illustrations/hanging.png"),
      onPress: handleAttiaHangPress,
    },
    {
      id: "attia-farmer-walk",
      title: "Attia Farmer Walk Challenge",
      description:
        "Walk for 1 minute carrying body weight (men) or 75% body weight (women).",
      image: require("../../assets/illustrations/farmer-walk.png"),
      onPress: handleAttiaFarmerWalkPress,
    },
  ];

  return (
    <View style={styles.screen}>
      <Svg style={styles.backgroundGradient} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient
            id="challengesGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={Colors.backgroundGradientStart} />
            <Stop offset="55%" stopColor={Colors.backgroundGradientMid} />
            <Stop offset="100%" stopColor={Colors.backgroundGradientEnd} />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#challengesGradient)"
        />
      </Svg>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Challenges</Text>
          <Text style={styles.subtitle}>
            Test yourself against proven benchmarks
          </Text>
        </View>

        {challenges.map((challenge) => (
          <ImageOverlayCard
            key={challenge.id}
            image={challenge.image}
            title={challenge.title}
            description={challenge.description}
            onPress={challenge.onPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondaryHigh,
  },
});
