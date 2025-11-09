import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function HangTimeInputScreen() {
  const navigation = useNavigation<HangTimeInputScreenNavigationProp>();
  const { userProfile } = useData();
  const headerHeight = useHeaderHeight();

  // Get user's gender for benchmark calculation
  const userGender = userProfile?.gender || "male";
  // Attia benchmark: Men = 120s (2:00), Women = 90s (1:30)
  const attiaBenchmark = userGender === "male" ? 120 : 90;

  // Calculate levels based on Attia benchmark percentages
  const levels = useMemo(() => {
    const calculateTime = (percentage: number) => {
      const totalSeconds = Math.round((attiaBenchmark * percentage) / 100);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return {
        totalSeconds,
        formatted: `${mins}:${secs.toString().padStart(2, "0")}`,
      };
    };

    return [
      {
        id: "first-time",
        name: "First Time",
        percentage: 10,
        ...calculateTime(10),
        description: `${10}% of benchmark`,
      },
      {
        id: "beginner",
        name: "Beginner",
        percentage: 20,
        ...calculateTime(20),
        description: `${20}% of benchmark`,
      },
      {
        id: "intermediate",
        name: "Intermediate",
        percentage: 40,
        ...calculateTime(40),
        description: `${40}% of benchmark`,
      },
      {
        id: "advanced",
        name: "Advanced",
        percentage: 80,
        ...calculateTime(80),
        description: `${80}% of benchmark`,
      },
      {
        id: "master",
        name: "Master",
        percentage: 100,
        ...calculateTime(100),
        description: `${100}% of benchmark`,
      },
      {
        id: "custom",
        name: "Custom",
        totalSeconds: 0,
        formatted: "Custom",
        percentage: 0,
        description: "Set your own time",
      },
    ];
  }, [attiaBenchmark]);

  // Determine recommended level based on activity level
  const recommendedLevel = useMemo(() => {
    const activityLevel = userProfile?.activityLevel;
    if (!activityLevel) return null;

    // Map activity level to recommended difficulty
    switch (activityLevel) {
      case "sedentary":
        return "first-time";
      case "lightly-active":
        return "beginner";
      case "moderately-active":
        return "intermediate";
      case "very-active":
        return "advanced";
      case "extremely-active":
        return "advanced";
      default:
        return "beginner";
    }
  }, [userProfile?.activityLevel]);

  const [minutes, setMinutes] = useState("2");
  const [seconds, setSeconds] = useState("0");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showLevels, setShowLevels] = useState(true);

  const handleLevelSelect = (level: any) => {
    setSelectedLevel(level.id);
    if (level.id !== "custom") {
      const mins = Math.floor(level.totalSeconds / 60);
      const secs = level.totalSeconds % 60;
      setMinutes(mins.toString());
      setSeconds(secs.toString());
      setShowLevels(false); // Hide levels when preset is selected
    } else {
      setShowLevels(false); // Hide levels when custom is selected
    }
  };

  const handleShowLevels = () => {
    setShowLevels(true);
    setSelectedLevel(null);
  };

  const handleStartChallenge = () => {
    const mins = parseInt(minutes || "0");
    const secs = parseInt(seconds || "0");
    const targetTime = mins * 60 + secs;

    if (targetTime <= 0) {
      alert("Please set a target time greater than 0");
      return;
    }

    navigation.navigate("HangStopwatch", { targetTime });
  };

  const formatTime = (time: string) => {
    return time.padStart(2, "0");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: headerHeight + 12,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.mainTitle}>SET YOUR TARGET TIME</Text>

        {showLevels ? (
          <>
            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.gray}
              />
              <Text style={styles.infoText}>
                Tailored based on the information provided during onboarding
              </Text>
            </View>

            {recommendedLevel && (
              <View style={styles.recommendationContainer}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={20}
                  color={Colors.hangColor}
                />
                <Text style={styles.recommendationText}>
                  Recommended:{" "}
                  {levels.find((l) => l.id === recommendedLevel)?.name ||
                    "Beginner"}
                  ({userProfile?.activityLevel?.replace("-", " ")})
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Choose Your Level</Text>
            <View style={styles.levelsContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    selectedLevel === level.id && styles.levelCardSelected,
                  ]}
                  onPress={() => handleLevelSelect(level)}
                >
                  <View style={styles.levelHeader}>
                    <View style={styles.levelHeaderLeft}>
                      <Text
                        style={[
                          styles.levelName,
                          selectedLevel === level.id &&
                            styles.levelNameSelected,
                        ]}
                      >
                        {level.name}
                      </Text>
                      {recommendedLevel === level.id && (
                        <View style={styles.recommendedBadge}>
                          <Ionicons
                            name="star"
                            size={14}
                            color={Colors.hangColor}
                          />
                          <Text style={styles.recommendedBadgeText}>
                            Recommended
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.levelTime,
                        selectedLevel === level.id && styles.levelTimeSelected,
                      ]}
                    >
                      {level.formatted}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.levelDescription,
                      selectedLevel === level.id &&
                        styles.levelDescriptionSelected,
                    ]}
                  >
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.customModeContainer}>
            <TouchableOpacity
              style={styles.backToLevelsButton}
              onPress={handleShowLevels}
            >
              <Text style={styles.backToLevelsText}>
                ← Choose Different Level
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.previewText}>
          Target: {formatTime(minutes)}:{formatTime(seconds)}
        </Text>

        {!showLevels && (
          <>
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>MINUTES</Text>
                <TextInput
                  style={styles.timeInput}
                  value={minutes}
                  onChangeText={(text) => {
                    setMinutes(text);
                    setSelectedLevel("custom");
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                />
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>SECONDS</Text>
                <TextInput
                  style={styles.timeInput}
                  value={seconds}
                  onChangeText={(text) => {
                    setSeconds(text);
                    setSelectedLevel("custom");
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartChallenge}
              >
                <Text style={styles.startButtonText}>START CHALLENGE</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    marginTop: 20,
    textAlign: "center",
  },
  levelsContainer: {
    marginBottom: 20,
  },
  customModeContainer: {
    marginBottom: 20,
  },
  backToLevelsButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
  },
  backToLevelsText: {
    color: Colors.hangColor,
    fontSize: 16,
    textAlign: "center",
  },
  levelCard: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  levelCardSelected: {
    borderColor: Colors.hangColor,
    backgroundColor: "#444",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  levelNameSelected: {
    color: Colors.hangColor,
  },
  levelTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.hangColor,
  },
  levelTimeSelected: {
    color: "#fff",
  },
  levelDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  levelDescriptionSelected: {
    color: "#fff",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 10,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#555",
  },
  separator: {
    fontSize: 48,
    color: "#fff",
    marginHorizontal: 20,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.gray,
    marginLeft: 8,
    flex: 1,
  },
  recommendationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.hangColor,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.hangColor,
    marginLeft: 8,
    fontWeight: "600",
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 53, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  recommendedBadgeText: {
    fontSize: 11,
    color: Colors.hangColor,
    marginLeft: 4,
    fontWeight: "600",
  },
  previewText: {
    fontSize: 18,
    color: "#4ECDC4",
    marginBottom: 40,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: Colors.hangColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
