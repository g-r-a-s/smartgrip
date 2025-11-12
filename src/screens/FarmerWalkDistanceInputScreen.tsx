import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";

const HERO_IMAGE = require("../../assets/illustrations/farmer-walk-challenge.png");

const toDisplay = (value: number, unit: string) => `${value}${unit}`;

type FarmerWalkInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkDistanceInput"
>;

export default function FarmerWalkDistanceInputScreen() {
  const { userProfile } = useData();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<FarmerWalkInputScreenNavigationProp>();

  const units = userProfile?.preferences?.units || "metric";
  const weightUnit = units === "metric" ? "kg" : "lbs";
  const distanceUnit = units === "metric" ? "m" : "yd";

  const userGender = userProfile?.gender || "male";
  const userWeight = userProfile?.weight || 70;

  const benchmarkTotalWeight =
    userGender === "male" ? userWeight : userWeight * 0.75;
  const benchmarkWeightPerHand = benchmarkTotalWeight / 2;
  const benchmarkDistance = 60;

  const levelPresets = useMemo(() => {
    const calculatePreset = (percentage: number) => {
      const weightRaw = (benchmarkWeightPerHand * percentage) / 100;
      const distanceRaw = (benchmarkDistance * percentage) / 100;

      if (units === "imperial") {
        const weightLbs = weightRaw * 2.20462;
        const distanceYds = distanceRaw * 1.09361;
        return {
          weightDisplay: toDisplay(Number(weightLbs.toFixed(1)), "lbs"),
          distanceDisplay: toDisplay(Math.round(distanceYds), "yd"),
          weightMetric: weightRaw,
          distanceMetric: distanceRaw,
        };
      }

      return {
        weightDisplay: toDisplay(Number(weightRaw.toFixed(1)), "kg"),
        distanceDisplay: toDisplay(Math.round(distanceRaw), "m"),
        weightMetric: weightRaw,
        distanceMetric: distanceRaw,
      };
    };

    const presets = [
      { id: "first-time", name: "First Time", percentage: 10 },
      { id: "beginner", name: "Beginner", percentage: 20 },
      { id: "intermediate", name: "Intermediate", percentage: 40 },
      { id: "advanced", name: "Advanced", percentage: 80 },
      { id: "master", name: "Master", percentage: 100 },
    ].map((preset) => {
      const values = calculatePreset(preset.percentage);
      return {
        ...preset,
        ...values,
        description: `Carry ${values.weightDisplay} per hand for ${values.distanceDisplay}`,
      };
    });

    presets.push({
      id: "custom",
      name: "Custom",
      percentage: 0,
      weightDisplay: "-",
      distanceDisplay: "-",
      weightMetric: 0,
      distanceMetric: 0,
      description: "Set your own goal",
    });

    return presets;
  }, [benchmarkDistance, benchmarkWeightPerHand, units]);

  const recommendedLevel = useMemo(() => {
    const activityLevel = userProfile?.activityLevel;
    switch (activityLevel) {
      case "sedentary":
        return "first-time";
      case "lightly-active":
        return "beginner";
      case "moderately-active":
        return "intermediate";
      case "very-active":
      case "extremely-active":
        return "advanced";
      default:
        return "beginner";
    }
  }, [userProfile?.activityLevel]);

  const [selectedLevel, setSelectedLevel] = useState<string>(
    recommendedLevel ?? "beginner"
  );

  const [distanceDisplay, setDistanceDisplay] = useState(() =>
    recommendedLevel
      ? levelPresets.find((p) => p.id === recommendedLevel)?.distanceDisplay ||
        "0"
      : "0"
  );

  const [weightDisplay, setWeightDisplay] = useState(() =>
    recommendedLevel
      ? levelPresets.find((p) => p.id === recommendedLevel)?.weightDisplay ||
        "0"
      : "0"
  );

  useEffect(() => {
    if (!recommendedLevel) return;
    const preset = levelPresets.find((p) => p.id === recommendedLevel);
    if (preset && preset.id !== "custom") {
      setSelectedLevel(recommendedLevel);
      setDistanceDisplay(preset.distanceDisplay);
      setWeightDisplay(preset.weightDisplay);
    }
  }, [recommendedLevel, levelPresets]);

  const handleLevelSelect = (presetId: string) => {
    setSelectedLevel(presetId);
    const preset = levelPresets.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.id === "custom") {
      setDistanceDisplay("0");
      setWeightDisplay("0");
      return;
    }

    setDistanceDisplay(preset.distanceDisplay);
    setWeightDisplay(preset.weightDisplay);
  };

  const parseDisplayValue = (display: string) => {
    const numeric = parseFloat(display.replace(/[^0-9.]/g, "")) || 0;
    if (units === "imperial") {
      if (display.includes("yd")) {
        return numeric / 1.09361;
      }
      if (display.includes("lbs")) {
        return numeric / 2.20462;
      }
    }
    return numeric;
  };

  const handleContinue = () => {
    navigation.navigate("FarmerWalkReady", {
      distanceDisplay,
      weightDisplay,
      units,
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={HERO_IMAGE}
          style={styles.heroImage}
          imageStyle={styles.heroImageInner}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.challengeTitle}>Farmer walk challenge</Text>
        <Text style={styles.challengeLead}>
          Build grip endurance, stability, and core strength with loaded
          carries.
        </Text>
        <Text style={styles.challengeBody}>
          Choose a preset or set your own weight and distance for each hand. Aim
          to carry evenly while maintaining strong posture throughout the walk.
        </Text>

        <Text style={styles.sectionHeading}>Choose your level *</Text>

        <View style={styles.presetList}>
          {levelPresets.map((level) => {
            const isSelected = selectedLevel === level.id;
            const isCustom = level.id === "custom";
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.presetItem,
                  isSelected && styles.presetItemSelected,
                ]}
                onPress={() => handleLevelSelect(level.id)}
                activeOpacity={0.9}
              >
                <View style={styles.presetLeft}>
                  <Text
                    style={[
                      styles.presetName,
                      isSelected && styles.presetNameSelected,
                    ]}
                  >
                    {level.name}
                  </Text>
                  <Text
                    style={[
                      styles.presetDescription,
                      isSelected && styles.presetDescriptionSelected,
                    ]}
                  >
                    {level.description}
                  </Text>
                  {level.id === recommendedLevel ? (
                    <View style={styles.recommendedTag}>
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color={Colors.farmerWalksColor}
                      />
                      <Text style={styles.recommendedTagText}>Recommended</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.presetRight}>
                  {isCustom ? (
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="rgba(26, 29, 31, 0.55)"
                    />
                  ) : (
                    <View style={styles.timeBadge}>
                      <Ionicons
                        name="walk-outline"
                        size={16}
                        color={Colors.farmerWalksColor}
                      />
                      <Text style={styles.timeBadgeText}>
                        {level.distanceDisplay}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Start Farmer Walk</Text>
          <View style={styles.continueIcon}>
            <Ionicons name="play" size={20} color={Colors.white} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroWrapper: {
    borderRadius: 32,
  },
  heroImage: {
    width: "100%",
    height: 220,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  heroImageInner: {
    borderRadius: 32,
    resizeMode: "cover",
  },
  card: {
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: "#2b1d12",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryPill: {
    backgroundColor: "rgba(119, 209, 149, 0.16)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: "Lufga-Bold",
    color: Colors.farmerWalksColor,
  },
  challengeTitle: {
    fontSize: 26,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
    marginBottom: 10,
  },
  challengeLead: {
    fontSize: 15,
    color: "rgba(26, 29, 31, 0.7)",
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: "Lufga-Regular",
  },
  challengeBody: {
    fontSize: 14,
    color: "rgba(26, 29, 31, 0.6)",
    lineHeight: 20,
    marginBottom: 18,
    fontFamily: "Lufga-Regular",
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
    marginBottom: 18,
  },
  presetList: {
    gap: 12,
    marginBottom: 24,
  },
  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(26, 29, 31, 0.06)",
  },
  presetItemSelected: {
    borderColor: Colors.farmerWalksColor,
  },
  presetLeft: {
    flex: 1,
    paddingRight: 12,
  },
  presetRight: {
    marginLeft: 12,
  },
  presetName: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
  },
  presetNameSelected: {
    color: Colors.farmerWalksColor,
  },
  presetDescription: {
    fontSize: 13,
    marginTop: 4,
    color: "rgba(26, 29, 31, 0.55)",
    fontFamily: "Lufga-Regular",
  },
  presetDescriptionSelected: {},
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  timeBadgeText: {
    fontSize: 13,
    fontFamily: "Lufga-Bold",
    color: Colors.farmerWalksColor,
  },
  recommendedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(119, 209, 149, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recommendedTagText: {
    fontSize: 12,
    fontFamily: "Lufga-Bold",
    color: Colors.farmerWalksColor,
  },
  continueButton: {
    marginTop: 32,
    width: "100%",
    borderRadius: 50,
    paddingVertical: 8,
    backgroundColor: Colors.farmerWalksColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 8,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Lufga-Bold",
  },
  continueIcon: {
    width: 56,
    height: 56,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
