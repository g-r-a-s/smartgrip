import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
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
          <TouchableOpacity
            key={challenge.id}
            style={styles.challengeCard}
            onPress={challenge.onPress}
            activeOpacity={0.85}
          >
            <Image
              source={challenge.image}
              style={styles.challengeIllustration}
              resizeMode="cover"
            />
            <View style={styles.challengeOverlay}>
              <View style={styles.challengeTextBlock}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                {/* <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text> */}
              </View>
              <View style={styles.challengeButton}>
                <Ionicons
                  name="arrow-forward-outline"
                  size={20}
                  color={Colors.textPrimaryHigh}
                />
              </View>
            </View>
          </TouchableOpacity>
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
    fontWeight: "800",
    color: Colors.textPrimaryHigh,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondaryHigh,
  },
  challengeCard: {
    width: 343,
    height: 343,
    borderRadius: 50,
    overflow: "hidden",
  },
  challengeIllustration: {
    width: "105%",
    height: "150%",
  },
  challengeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(45, 48, 53, 0.5)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
  },
  challengeTextBlock: {
    flex: 1,
    paddingRight: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  challengeDescription: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.82)",
    lineHeight: 18,
  },
  challengeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
