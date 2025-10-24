import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CelebrationModal from "../components/CelebrationModal";
import { Colors } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { FarmerWalkActivity } from "../types/activities";

type FarmerWalkScreenRouteProp = RouteProp<
  RootStackParamList,
  "FarmerWalkDistance"
>;

type FarmerWalkScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkDistance"
>;

export default function FarmerWalkScreen() {
  const route = useRoute<FarmerWalkScreenRouteProp>();
  const navigation = useNavigation<FarmerWalkScreenNavigationProp>();
  const targetDistance = route.params?.targetDistance || 100; // default to 100 meters
  const leftHandWeight = route.params?.leftHandWeight || 5; // default to 5kg
  const rightHandWeight = route.params?.rightHandWeight || 5; // default to 5kg
  const { user } = useAuth();
  const { createActivity, createSession, updateSession } = useData();

  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [splits, setSplits] = useState<
    Array<{
      start: Date;
      end: Date;
      value: number;
      metric: "meters";
      isRest: boolean;
    }>
  >([]);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSplitDistance, setCurrentSplitDistance] = useState("");

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

  // Format distance helper
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(1)} m`;
  };

  // Calculate total distance from splits
  const totalDistance = splits.reduce((sum, split) => sum + split.value, 0);

  // Check if challenge is completed
  useEffect(() => {
    if (totalDistance >= targetDistance && !isCompleted && splits.length > 0) {
      setIsCompleted(true);

      // Show celebration modal immediately (optimistic)
      setShowCelebration(true);

      // Save data in background (don't await)
      saveSessionData();
    }
  }, [totalDistance, targetDistance, isCompleted, splits]);

  const saveSessionData = async () => {
    if (!user || !sessionStartTime || splits.length === 0) return;

    try {
      // Create farmer walk activity
      const activity = await createActivity({
        type: "farmer-walk",
        targetDistance: targetDistance,
        leftHandWeight: leftHandWeight,
        rightHandWeight: rightHandWeight,
      } as Omit<FarmerWalkActivity, "id" | "userId" | "createdAt">);

      // Create session with distance splits
      const session = await createSession({
        challengeId: activity.id,
        startTime: sessionStartTime,
        endTime: new Date(),
        totalElapsedTime: 0, // No time tracking
        completed: true,
        splits: splits.map((split) => ({
          id: `split-${Date.now()}-${Math.random()}`,
          sessionId: "", // Will be set after session creation
          startTime: split.start,
          endTime: split.end,
          value: split.value,
          metric: split.metric,
          isRest: split.isRest,
        })),
      });

      // Update session with correct sessionId for splits
      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });
    } catch (error) {
      console.error("Failed to save session:", error);
      Alert.alert("Error", "Failed to save your session. Please try again.");
    }
  };

  const handleStartSession = () => {
    setSessionStartTime(new Date());
    setSplits([]);
    setCurrentDistance(0);
    setIsCompleted(false);
    setCurrentSplitDistance("");
  };

  const handleAddSplit = () => {
    const distance = parseFloat(currentSplitDistance);
    if (!distance || distance <= 0) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid distance greater than 0"
      );
      return;
    }

    const now = new Date();
    const newSplit = {
      start: now,
      end: now,
      value: distance,
      metric: "meters" as const,
      isRest: false,
    };

    setSplits((prev) => [...prev, newSplit]);
    setCurrentDistance((prev) => prev + distance);
    setCurrentSplitDistance("");
  };

  const handleReset = () => {
    setSessionStartTime(null);
    setSplits([]);
    setCurrentDistance(0);
    setIsCompleted(false);
    setCurrentSplitDistance("");
  };

  return (
    <View style={styles.container}>
      <CelebrationModal
        visible={showCelebration}
        details={`You walked ${formatDistance(targetDistance)} in ${
          splits.length
        } split${splits.length > 1 ? "s" : ""}!`}
        buttonText="Play again!"
        themeColor={Colors.farmerWalksColor}
        onButtonPress={() => {
          setShowCelebration(false);
          navigation.goBack();
        }}
      />

      <View style={styles.challengeInfo}>
        <Text style={styles.targetText}>
          Target: {formatDistance(targetDistance)}
        </Text>
      </View>

      <View style={styles.distanceContainer}>
        <Text style={styles.distanceLabel}>Distance Covered</Text>
        <Text style={styles.distanceText}>{formatDistance(totalDistance)}</Text>
        <Text style={styles.progressText}>
          {((totalDistance / targetDistance) * 100).toFixed(1)}%
        </Text>
      </View>

      <View style={styles.splitsContainer}>
        <Text style={styles.splitsLabel}>Splits: {splits.length}</Text>
      </View>

      {!isCompleted && sessionStartTime && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Add Distance Traveled</Text>
          <TextInput
            style={styles.distanceInput}
            value={currentSplitDistance}
            onChangeText={setCurrentSplitDistance}
            placeholder="Enter meters"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
            autoFocus
          />
          <TouchableOpacity
            style={styles.addDistanceButton}
            onPress={handleAddSplit}
          >
            <Text style={styles.addDistanceButtonText}>ADD DISTANCE</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!sessionStartTime ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
          >
            <Text style={styles.startButtonText}>START SESSION</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Farmer Walk Challenge</Text>
            <Text style={styles.modalText}>
              Walk the target distance carrying weights.{"\n\n"}
              Start a session and add each distance you walk.{"\n"}
              Keep adding splits until you reach your target distance.{"\n\n"}
              We'll track your total distance progress!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  challengeInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  targetText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
  },
  splitsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  splitsLabel: {
    fontSize: 16,
    color: Colors.gray,
  },
  distanceContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  distanceLabel: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.farmerWalksColor,
  },
  progressText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 5,
  },
  inputContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 10,
  },
  distanceInput: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 24,
    color: Colors.white,
    textAlign: "center",
    width: 150,
    marginBottom: 15,
  },
  addDistanceButton: {
    backgroundColor: Colors.farmerWalksColor,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  addDistanceButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: Colors.farmerWalksColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.farmerWalksColor,
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: Colors.darkGray,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.farmerWalksColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
