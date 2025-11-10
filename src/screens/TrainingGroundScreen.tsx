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

const hangIllustration = require("../../assets/illustrations/hanging.png");
const farmerIllustration = require("../../assets/illustrations/farmer-walk.png");
const dynamometerIllustration = require("../../assets/illustrations/hanging.png");

const EXERCISES = [
  {
    id: "hang",
    title: "Hang for Time",
    description:
      "Build grip strength and endurance by hanging from a bar. Track your progress across sets and rest periods.",
    image: hangIllustration,
    secondaryBadge: {
      label: "Grip • Endurance",
      iconName: "timer-outline" as const,
    },
    route: "HangTimeInput",
  },
  {
    id: "farmer-walk",
    title: "Farme Carry",
    description:
      "Carry weight while walking to develop grip and core stability. Customize your distance and load.",
    image: farmerIllustration,
    secondaryBadge: {
      label: "Grip • Core",
      iconName: "barbell-outline" as const,
    },
    route: "FarmerWalkDistanceInput",
  },
  {
    id: "dynamometer",
    title: "Dynamometer Test",
    description:
      "Log left and right-hand grip strength with your dynamometer to monitor progress over time.",
    image: dynamometerIllustration,
    secondaryBadge: {
      label: "Track both hands",
      iconName: "stats-chart-outline" as const,
    },
    route: "DynamometerInput",
  },
];

export default function TrainingGroundScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <Svg style={styles.backgroundGradient} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient
            id="trainingGradient"
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
          fill="url(#trainingGradient)"
        />
      </Svg>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Training</Text>
          <Text style={styles.subtitle}>Build your strength and endurance</Text>
        </View>

        <View style={styles.cardsStack}>
          {EXERCISES.map((exercise) => (
            <ImageOverlayCard
              key={exercise.id}
              image={exercise.image}
              title={exercise.title}
              description={exercise.description}
              secondaryBadge={exercise.secondaryBadge}
              onPress={() => (navigation as any).navigate(exercise.route)}
            />
          ))}
        </View>
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
    gap: 24,
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
  cardsStack: {
    gap: 24,
  },
});
