import { Ionicons } from "@expo/vector-icons";
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
  const { userProfile } = useData();

  // Get user's unit preference
  const units = userProfile?.preferences?.units || "metric";
  const weightUnit = units === "metric" ? "kg" : "lbs";
  const defaultWeight = units === "metric" ? "5" : "11"; // 5kg ≈ 11lbs

  const [distance, setDistance] = useState("100");
  const [leftWeight, setLeftWeight] = useState(defaultWeight);
  const [rightWeight, setRightWeight] = useState(defaultWeight);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showLevels, setShowLevels] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Define difficulty levels - values in metric, convert to imperial if needed
  const levels = [
    {
      id: "never",
      name: "First Time",
      distance: units === "metric" ? "50" : "55", // 50m ≈ 55yds
      weight: units === "metric" ? "2.5" : "5.5", // 2.5kg ≈ 5.5lbs
      description: "Carry 2.5kg on each hand for 50m",
      descriptionImperial: "Carry 5.5lbs on each hand for 55yd",
    },
    {
      id: "beginner",
      name: "Beginner",
      distance: units === "metric" ? "100" : "110",
      weight: units === "metric" ? "5" : "11",
      description: "Carry 5kg on each hand for 100m",
      descriptionImperial: "Carry 11lbs on each hand for 110yd",
    },
    {
      id: "medium",
      name: "Medium",
      distance: units === "metric" ? "200" : "220",
      weight: units === "metric" ? "10" : "22",
      description: "Carry 10kg on each hand for 200m",
      descriptionImperial: "Carry 22lbs on each hand for 220yd",
    },
    {
      id: "advanced",
      name: "Advanced",
      distance: units === "metric" ? "300" : "330",
      weight: units === "metric" ? "16" : "35",
      description: "Carry 16kg on each hand for 300m",
      descriptionImperial: "Carry 35lbs on each hand for 330yd",
    },
    {
      id: "custom",
      name: "Custom",
      distance: "Custom",
      weight: "Custom",
      description: "Set your own challenge",
      descriptionImperial: "Set your own challenge",
    },
  ];

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
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>SET YOUR CHALLENGE</Text>

          {showLevels ? (
            <>
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
                      <Text
                        style={[
                          styles.levelName,
                          selectedLevel === level.id &&
                            styles.levelNameSelected,
                        ]}
                      >
                        {level.name}
                      </Text>
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
                      {units === "metric"
                        ? level.description
                        : level.descriptionImperial}
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
                      placeholder={defaultWeight}
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
                      placeholder={defaultWeight}
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
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    marginTop: 20,
    textAlign: "center",
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
  levelName: {
    fontSize: 18,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    marginBottom: 15,
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    fontWeight: "600",
  },
});
