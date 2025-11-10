import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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

type HangTimeInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HangTimeInput"
>;

const HERO_IMAGE = require("../../assets/illustrations/hang-challenge-chose-level-illustration.png");

export default function HangTimeInputScreen() {
  const navigation = useNavigation<HangTimeInputScreenNavigationProp>();
  const { userProfile } = useData();
  const headerHeight = useHeaderHeight();

  const levelPresets = useMemo(
    () => [
      {
        id: "never",
        name: "Newbie",
        description: "First time trying",
        totalSeconds: 10,
      },
      {
        id: "beginner",
        name: "Beginner",
        description: "Just getting started",
        totalSeconds: 20,
      },
      {
        id: "medium",
        name: "Medium",
        description: "Some experience",
        totalSeconds: 45,
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Strong grip",
        totalSeconds: 60,
      },
      {
        id: "custom",
        name: "Custom",
        description: "Set your own time",
        totalSeconds: 0,
      },
    ],
    []
  );

  const [minutes, setMinutes] = useState("2");
  const [seconds, setSeconds] = useState("0");
  const recommendedLevel = useMemo(() => {
    const activityLevel = userProfile?.activityLevel;
    switch (activityLevel) {
      case "sedentary":
        return "never";
      case "lightly-active":
        return "beginner";
      case "moderately-active":
        return "medium";
      case "very-active":
      case "extremely-active":
        return "advanced";
      default:
        return "beginner";
    }
  }, [userProfile?.activityLevel]);

  const [selectedLevel, setSelectedLevel] = useState<string>(
    recommendedLevel ?? "medium"
  );

  const handleLevelSelect = (levelId: string, totalSeconds: number) => {
    setSelectedLevel(levelId);
    if (levelId !== "custom") {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setMinutes(mins.toString());
      setSeconds(secs.toString());
    }
  };

  const handleStartChallenge = () => {
    const mins = parseInt(minutes || "0", 10);
    const secs = parseInt(seconds || "0", 10);
    const targetTime = mins * 60 + secs;

    if (targetTime <= 0) {
      Alert.alert("Please set a target time greater than 0");
      return;
    }

    navigation.navigate("HangReady", { targetSeconds: targetTime });
  };

  const formatTime = (time: string) => {
    return time.padStart(2, "0");
  };

  const formatSecondsDisplay = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const targetTimeInSeconds =
    parseInt(minutes || "0", 10) * 60 + parseInt(seconds || "0", 10);
  const isContinueDisabled = targetTimeInSeconds <= 0;

  useEffect(() => {
    if (!recommendedLevel) return;
    const preset = levelPresets.find(
      (preset) => preset.id === recommendedLevel
    );
    if (preset) {
      setSelectedLevel(recommendedLevel);
      if (preset.id !== "custom") {
        const mins = Math.floor(preset.totalSeconds / 60);
        const secs = preset.totalSeconds % 60;
        setMinutes(mins.toString());
        setSeconds(secs.toString());
      }
    }
  }, [recommendedLevel, levelPresets]);

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={HERO_IMAGE}
          style={styles.heroImage}
          imageStyle={styles.heroImageInner}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.challengeTitle}>Hang For time</Text>
        <Text style={styles.challengeLead}>
          Enhance your grip strength and endurance by incorporating bar hangs
          into your routine.
        </Text>
        <Text style={styles.challengeBody}>
          Aim for a specific target time, and monitor your progress by
          performing multiple sets with designated rest periods in between.
        </Text>
        <Text style={styles.challengeBody}>
          This method not only builds strength but also improves your overall
          stability and control.
        </Text>

        <Text style={styles.sectionHeading}>Set your target time *</Text>

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
                onPress={() => handleLevelSelect(level.id, level.totalSeconds)}
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
                        color={Colors.accentOrange}
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
                        name="time-outline"
                        size={16}
                        color={Colors.accentOrange}
                      />
                      <Text style={styles.timeBadgeText}>
                        {formatSecondsDisplay(level.totalSeconds)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            isContinueDisabled && styles.continueButtonDisabled,
          ]}
          onPress={handleStartChallenge}
          disabled={isContinueDisabled}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "rgb(224, 224, 224)",
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
    // marginTop: -40,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 32,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: "rgba(26, 29, 31, 0.45)",
  },
  challengeTitle: {
    fontSize: 28,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
    marginBottom: 12,
  },
  challengeLead: {
    fontSize: 15,
    color: "rgba(26, 29, 31, 0.7)",
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: "Lufga-Regular",
  },
  challengeBody: {
    fontSize: 14,
    color: "rgba(26, 29, 31, 0.6)",
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: "Lufga-Regular",
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
    marginTop: 8,
    marginBottom: 20,
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
    shadowColor: "#e2d4c6",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  presetItemSelected: {
    borderColor: Colors.accentOrange,
  },
  presetLeft: {
    flex: 1,
  },
  presetRight: {
    marginLeft: 16,
  },
  presetName: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
  },
  presetNameSelected: {
    color: Colors.accentOrange,
  },
  presetDescription: {
    fontSize: 13,
    marginTop: 4,
    color: "rgba(26, 29, 31, 0.55)",
    fontFamily: "Lufga-Regular",
  },
  presetDescriptionSelected: {
    color: "rgba(255, 122, 46, 0.85)",
  },
  recommendedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 122, 46, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recommendedTagText: {
    fontSize: 12,
    fontFamily: "Lufga-Bold",
    color: Colors.accentOrange,
  },
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
    color: Colors.accentOrange,
  },
  inputsSection: {
    paddingTop: 12,
    marginBottom: 32,
  },
  inputsLabel: {
    fontSize: 13,
    fontFamily: "Lufga-Bold",
    color: "rgba(26, 29, 31, 0.55)",
    marginBottom: 12,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  timeInputWrapper: {
    alignItems: "center",
  },
  timeInputLabel: {
    fontSize: 12,
    color: "rgba(26, 29, 31, 0.45)",
    marginBottom: 8,
    fontFamily: "Lufga-Regular",
  },
  timeInput: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(26, 29, 31, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontSize: 32,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
  },
  timeSeparator: {
    fontSize: 32,
    fontFamily: "Lufga-Bold",
    color: "rgba(26, 29, 31, 0.45)",
  },
  continueButton: {
    marginTop: 16,
    backgroundColor: Colors.accentOrange,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accentOrange,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  continueButtonDisabled: {
    backgroundColor: "rgba(255, 122, 46, 0.35)",
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: "Lufga-Bold",
  },
});
