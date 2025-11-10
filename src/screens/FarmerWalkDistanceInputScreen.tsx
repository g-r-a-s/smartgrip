import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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

type FarmerWalkDistanceInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkDistanceInput"
>;

export default function FarmerWalkDistanceInputScreen() {
  const navigation =
    useNavigation<FarmerWalkDistanceInputScreenNavigationProp>();
  const headerHeight = useHeaderHeight();
  const { userProfile } = useData();

  // Get user's unit preference and data
  const units = userProfile?.preferences?.units || "metric";
  const weightUnit = units === "metric" ? "kg" : "lbs";
  const userGender = userProfile?.gender || "male";
  const userWeight = userProfile?.weight || 70; // Default weight

  // Attia Farmer Walk benchmark: 1 minute (60s) carrying body weight (men) or 75% body weight (women)
  // Weight is divided between TWO hands, so per-hand weight = total weight / 2
  // For training, we translate this to distance + weight percentages
  // Using 1 minute ≈ 60-80 meters at walking pace with weights as baseline
  const attiaBenchmarkTotalWeight =
    userGender === "male" ? userWeight : userWeight * 0.75;
  const attiaBenchmarkWeightPerHand = attiaBenchmarkTotalWeight / 2; // Weight is split between both hands
  const attiaBenchmarkDistance = 60; // 60m baseline (approximately 1 minute walk with weight)

  // Calculate levels based on Attia benchmark percentages
  const levels = React.useMemo(() => {
    const calculateValues = (percentage: number) => {
      const weightValue = (attiaBenchmarkWeightPerHand * percentage) / 100;
      const distanceValue = (attiaBenchmarkDistance * percentage) / 100;

      if (units === "imperial") {
        // Convert to imperial
        const weightLbs = weightValue * 2.20462;
        const distanceYds = distanceValue * 1.09361;
        return {
          weight: weightLbs.toFixed(1),
          distance: distanceYds.toFixed(0),
          weightMetric: weightValue,
          distanceMetric: distanceValue,
        };
      } else {
        return {
          weight: weightValue.toFixed(1),
          distance: distanceValue.toFixed(0),
          weightMetric: weightValue,
          distanceMetric: distanceValue,
        };
      }
    };

    const generateDescription = (level: any, percentage: number) => {
      if (units === "metric") {
        return `Carry ${level.weight}kg on each hand for ${level.distance}m (${percentage}% of benchmark)`;
      } else {
        return `Carry ${level.weight}lbs on each hand for ${level.distance}yd (${percentage}% of benchmark)`;
      }
    };

    const firstTime = calculateValues(10);
    const beginner = calculateValues(20);
    const intermediate = calculateValues(40);
    const advanced = calculateValues(80);
    const master = calculateValues(100);

    return [
      {
        id: "first-time",
        name: "First Time",
        percentage: 10,
        ...firstTime,
        description: generateDescription(firstTime, 10),
      },
      {
        id: "beginner",
        name: "Beginner",
        percentage: 20,
        ...beginner,
        description: generateDescription(beginner, 20),
      },
      {
        id: "intermediate",
        name: "Intermediate",
        percentage: 40,
        ...intermediate,
        description: generateDescription(intermediate, 40),
      },
      {
        id: "advanced",
        name: "Advanced",
        percentage: 80,
        ...advanced,
        description: generateDescription(advanced, 80),
      },
      {
        id: "master",
        name: "Master",
        percentage: 100,
        ...master,
        description: generateDescription(master, 100),
      },
      {
        id: "custom",
        name: "Custom",
        weight: "Custom",
        distance: "Custom",
        percentage: 0,
        weightMetric: 0,
        distanceMetric: 0,
        description: "Set your own challenge",
      },
    ];
  }, [attiaBenchmarkWeightPerHand, attiaBenchmarkDistance, units]);

  // Determine recommended level based on activity level
  const recommendedLevel = React.useMemo(() => {
    const activityLevel = userProfile?.activityLevel;
    if (!activityLevel) return null;

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

  const [distance, setDistance] = useState("100");
  const [leftWeight, setLeftWeight] = useState(units === "metric" ? "5" : "11");
  const [rightWeight, setRightWeight] = useState(
    units === "metric" ? "5" : "11"
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showLevels, setShowLevels] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const handleLevelSelect = (level: any) => {
    setSelectedLevel(level.id);
    if (level.id !== "custom") {
      setDistance(level.distance);
      setLeftWeight(level.weight);
      setRightWeight(level.weight);
      setShowLevels(false); // Hide levels when preset is selected
    } else {
      setShowLevels(false); // Hide levels when custom is selected
    }
  };

  const handleShowLevels = () => {
    setShowLevels(true);
    setSelectedLevel(null);
  };

  // Add info button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="information-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleStartChallenge = () => {
    if (showLevels) {
      alert("Please select a difficulty level first");
      return;
    }

    const targetDistance = parseFloat(distance);
    const leftWeightNum = parseFloat(leftWeight);
    const rightWeightNum = parseFloat(rightWeight);

    if (!targetDistance || targetDistance <= 0) {
      alert("Please set a target distance greater than 0");
      return;
    }

    if (
      !leftWeightNum ||
      leftWeightNum < 0 ||
      !rightWeightNum ||
      rightWeightNum < 0
    ) {
      alert("Please set valid weights for both hands");
      return;
    }

    // Convert to metric if needed (navigate always uses metric)
    let targetDistanceMetric = targetDistance;
    let leftWeightMetric = leftWeightNum;
    let rightWeightMetric = rightWeightNum;

    if (units === "imperial") {
      // Convert yards to meters
      targetDistanceMetric = targetDistance * 0.9144;
      // Convert lbs to kg
      leftWeightMetric = leftWeightNum * 0.453592;
      rightWeightMetric = rightWeightNum * 0.453592;
    }

    navigation.navigate("FarmerWalkDistance", {
      targetDistance: targetDistanceMetric,
      leftHandWeight: leftWeightMetric,
      rightHandWeight: rightWeightMetric,
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        style={[
          styles.container,
          {
            paddingTop: headerHeight + 12,
          },
        ]}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>SET YOUR CHALLENGE</Text>

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
                    color={Colors.farmerWalksColor}
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
                              color={Colors.farmerWalksColor}
                            />
                            <Text style={styles.recommendedBadgeText}>
                              Recommended
                            </Text>
                          </View>
                        )}
                      </View>
                      {level.id !== "custom" && (
                        <View style={styles.levelStats}>
                          <Text
                            style={[
                              styles.levelValue,
                              selectedLevel === level.id &&
                                styles.levelValueSelected,
                            ]}
                          >
                            {level.distance}
                            {units === "metric" ? "m" : "yd"}
                          </Text>
                          <Text style={styles.levelValueSeparator}> • </Text>
                          <Text
                            style={[
                              styles.levelValue,
                              selectedLevel === level.id &&
                                styles.levelValueSelected,
                            ]}
                          >
                            {level.weight}
                            {weightUnit}
                          </Text>
                        </View>
                      )}
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

          {!showLevels && (
            <>
              <Text style={styles.previewText}>
                Target: {distance}
                {units === "metric" ? "m" : "yd"} • {leftWeight}
                {weightUnit} per hand
              </Text>

              {/* Distance Input */}
              <View style={styles.distanceInputContainer}>
                <Text style={styles.distanceLabel}>
                  {units === "metric" ? "METERS" : "YARDS"}
                </Text>
                <TextInput
                  style={styles.distanceInput}
                  value={distance}
                  onChangeText={(text) => {
                    setDistance(text);
                    setSelectedLevel("custom");
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="100"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              {/* Weight Inputs */}
              <View style={styles.weightInputContainer}>
                <Text style={styles.weightLabel}>WEIGHT PER HAND</Text>
                <View style={styles.weightInputsRow}>
                  <View style={styles.weightInputGroup}>
                    <Text style={styles.handLabel}>LEFT</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={leftWeight}
                      onChangeText={(text) => {
                        setLeftWeight(text);
                        setSelectedLevel("custom");
                      }}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder={units === "metric" ? "5" : "11"}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    <Text style={styles.weightUnit}>{weightUnit}</Text>
                  </View>

                  <View style={styles.weightInputGroup}>
                    <Text style={styles.handLabel}>RIGHT</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={rightWeight}
                      onChangeText={(text) => {
                        setRightWeight(text);
                        setSelectedLevel("custom");
                      }}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder={units === "metric" ? "5" : "11"}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    <Text style={styles.weightUnit}>{weightUnit}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartChallenge}
              >
                <Text style={styles.startButtonText}>START CHALLENGE</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Info Modal */}
      <Modal
        visible={showInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfo(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Training Ground</Text>
            <Text style={styles.modalText}>
              This is your training ground where you build the foundation of
              your strength.{"\n\n"}
              Use this activity to get comfortable carrying weight while
              walking.{"\n\n"}
              Start light and gradually increase both weight and distance as you
              gain confidence.{"\n\n"}
              Focus on your core stability and arm strength - these are the
              building blocks for bigger challenges ahead.{"\n\n"}
              Master this, and you'll find other challenges much easier to
              tackle!
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.modalCloseText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  infoButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Lufga-Bold",
    color: Colors.text,
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Lufga-Bold",
    color: Colors.text,
    marginBottom: 16,
    marginTop: 20,
    textAlign: "center",
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
    backgroundColor: "rgba(255, 105, 157, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.farmerWalksColor,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.farmerWalksColor,
    marginLeft: 8,
    fontFamily: "Lufga-Bold",
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 105, 157, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  recommendedBadgeText: {
    fontSize: 11,
    color: Colors.farmerWalksColor,
    marginLeft: 4,
    fontFamily: "Lufga-Bold",
  },
  levelsContainer: {
    marginBottom: 20,
    width: "100%",
  },
  levelCard: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  levelCardSelected: {
    borderColor: Colors.farmerWalksColor,
    backgroundColor: "#2a1a2a",
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
    fontFamily: "Lufga-Bold",
    color: Colors.text,
  },
  levelNameSelected: {
    color: Colors.farmerWalksColor,
  },
  levelStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelValue: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: Colors.farmerWalksColor,
  },
  levelValueSelected: {
    color: Colors.text,
  },
  levelValueSeparator: {
    fontSize: 16,
    color: Colors.gray,
    marginHorizontal: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: Colors.gray,
  },
  levelDescriptionSelected: {
    color: Colors.text,
  },
  customModeContainer: {
    marginBottom: 20,
  },
  backToLevelsButton: {
    backgroundColor: Colors.darkGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backToLevelsText: {
    color: Colors.farmerWalksColor,
    fontSize: 16,
    textAlign: "center",
  },
  distanceInputContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  distanceLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  distanceInput: {
    backgroundColor: Colors.darkGray,
    color: Colors.text,
    fontSize: 48,
    fontFamily: "Lufga-Bold",
    textAlign: "center",
    width: 120,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewText: {
    fontSize: 18,
    color: Colors.farmerWalksColor,
    marginBottom: 30,
  },
  weightInputContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  weightLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
    fontFamily: "Lufga-Bold",
  },
  weightInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 300,
  },
  weightInputGroup: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  handLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
    fontWeight: "600",
  },
  weightInput: {
    backgroundColor: Colors.darkGray,
    color: Colors.text,
    fontSize: 24,
    fontFamily: "Lufga-Bold",
    textAlign: "center",
    width: 80,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  weightUnit: {
    fontSize: 12,
    color: Colors.gray,
  },
  startButton: {
    backgroundColor: Colors.farmerWalksColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: "Lufga-Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: Colors.farmerWalksColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCloseText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Lufga-Bold",
  },
});
