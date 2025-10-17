import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CelebrationModal from "../components/CelebrationModal";
import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { ActivitySession, HangActivity, Split } from "../types/activities";

type HangStopwatchScreenRouteProp = RouteProp<
  RootStackParamList,
  "HangStopwatch"
>;

export default function HangStopwatchScreen() {
  const route = useRoute<HangStopwatchScreenRouteProp>();
  const navigation = useNavigation();
  const targetTime = route.params?.targetTime || 120; // default to 2 minutes if not provided
  const { user } = useAuth();
  const { createActivity, createSession, updateSession } = useData();

  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [currentSplitStart, setCurrentSplitStart] = useState<Date | null>(null);
  const [currentSplitTime, setCurrentSplitTime] = useState(0);
  const [splits, setSplits] = useState<
    Array<{ start: Date; end: Date; duration: number }>
  >([]);
  const [completedTime, setCompletedTime] = useState(0); // Total hang time accumulated
  const [isCompleted, setIsCompleted] = useState(false);

  const splitIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Update current split time (only when hanging)
  useEffect(() => {
    if (isRunning && currentSplitStart) {
      splitIntervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - currentSplitStart.getTime()) / 1000
        );
        setCurrentSplitTime(elapsed);
      }, 100);
    } else {
      if (splitIntervalRef.current) {
        clearInterval(splitIntervalRef.current);
      }
    }

    return () => {
      if (splitIntervalRef.current) {
        clearInterval(splitIntervalRef.current);
      }
    };
  }, [isRunning, currentSplitStart]);

  // Update session time (always running after first start until completion)
  useEffect(() => {
    if (sessionStartTime && !isCompleted) {
      sessionIntervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - sessionStartTime.getTime()) / 1000
        );
        setSessionElapsedTime(elapsed);
      }, 100);
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [sessionStartTime, isCompleted]);

  // Save session data when challenge is completed
  const saveSessionData = async () => {
    if (!user || !sessionStartTime) return;

    try {
      // Create Hang Activity
      const activity: Omit<HangActivity, "id" | "userId" | "createdAt"> = {
        type: "hang",
        targetTime,
      };

      const savedActivity = await createActivity(activity);

      if (!savedActivity || !savedActivity.id) {
        throw new Error("Failed to create activity - no ID returned");
      }

      // Create Session (without splits first)
      const sessionEndTime = new Date();
      const tempSession: Omit<ActivitySession, "id" | "userId"> = {
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        totalElapsedTime: sessionElapsedTime,
        completed: true,
        splits: [], // Empty initially
        challengeId: savedActivity.id, // Link to the activity
      };

      const savedSession = await createSession(tempSession);

      // Now create splits with correct sessionId
      const sessionSplits: Split[] = splits.map((split, index) => ({
        id: `split-${index}`,
        sessionId: savedSession.id, // Now we have the correct session ID
        startTime: split.start,
        endTime: split.end,
        value: split.duration,
        metric: "seconds" as const,
        isRest: false, // All splits are hang time, not rest
      }));

      // Update session with the splits
      const updatedSession: Omit<ActivitySession, "id" | "userId"> = {
        ...savedSession,
        splits: sessionSplits,
      };

      await updateSession(savedSession.id, updatedSession);
    } catch (error) {
      console.error("Failed to save session:", error);
      Alert.alert(
        "Save Failed",
        "Could not save your session data. Please try again."
      );
    }
  };

  // Check if target is completed
  useEffect(() => {
    if (completedTime >= targetTime && !isCompleted) {
      setIsCompleted(true);

      // Show celebration modal immediately (optimistic)
      setShowCelebration(true);

      // Save data in background (don't await)
      saveSessionData();
    }
  }, [completedTime, targetTime, splits.length, isCompleted, navigation]);

  const handleStartStop = () => {
    if (!isRunning) {
      // Starting a new split
      const now = new Date();
      if (!sessionStartTime) {
        setSessionStartTime(now);
      }
      setCurrentSplitStart(now);
      setCurrentSplitTime(0);
      setIsRunning(true);
    } else {
      // Stopping current split
      if (currentSplitStart) {
        const now = new Date();
        const newSplit = {
          start: currentSplitStart,
          end: now,
          duration: Math.floor(
            (now.getTime() - currentSplitStart.getTime()) / 1000
          ),
        };

        setSplits((prev) => [...prev, newSplit]);
        setCompletedTime((prev) => prev + newSplit.duration);
        setCurrentSplitTime(0);
        setIsRunning(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CelebrationModal
        visible={showCelebration}
        details={`You reached ${formatTime(targetTime)} in ${
          splits.length
        } split${splits.length > 1 ? "s" : ""}!`}
        themeColor={Colors.hangColor}
        onButtonPress={() => {
          setShowCelebration(false);
          navigation.getParent()?.navigate("Progress");
        }}
      />

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
            <Text style={styles.modalTitle}>How It Works</Text>
            <Text style={styles.modalText}>
              Hang for your target time.{"\n\n"}
              Try to complete it in one shot.{"\n"}
              If you can't, stop the timer, rest, and get back up there.{"\n\n"}
              We'll track your splits and total session time.{"\n\n"}
              Watch your progress improve over time!
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

      {/* Target Display */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>Target</Text>
        <Text style={styles.targetTime}>{formatTime(targetTime)}</Text>
        <Text style={styles.completedText}>
          Completed: {formatTime(completedTime)}
        </Text>
      </View>

      {/* Current Split Timer */}
      <View style={styles.splitTimerContainer}>
        <Text style={styles.splitTime}>{formatTime(currentSplitTime)}</Text>
      </View>

      {/* Session Timer */}
      <View style={styles.sessionTimerContainer}>
        <Text style={styles.sessionTime}>{formatTime(sessionElapsedTime)}</Text>
      </View>

      {/* Splits Counter */}
      <View style={styles.splitsContainer}>
        <Text style={styles.splitsText}>Splits: {splits.length}</Text>
        {splits.length > 0 && (
          <Text style={styles.avgText}>
            Avg: {formatTime(Math.round(completedTime / splits.length))} per
            split
          </Text>
        )}
      </View>

      {/* Main Action Button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          isRunning ? styles.stopButton : styles.startButton,
          isCompleted && styles.completedButton,
        ]}
        onPress={handleStartStop}
        disabled={isCompleted}
      >
        <Text style={styles.mainButtonText}>
          {isCompleted
            ? "CHALLENGE COMPLETED!"
            : isRunning
            ? "STOP HANGING"
            : "START HANGING"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  targetContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  targetLabel: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 10,
  },
  targetTime: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  completedText: {
    fontSize: 20,
    color: "#4ECDC4",
    fontWeight: "bold",
  },
  splitTimerContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  splitTime: {
    fontSize: 72,
    color: Colors.hangColor,
    fontWeight: "bold",
  },
  sessionTimerContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  sessionTime: {
    fontSize: 48,
    color: "#9B59B6",
    fontWeight: "bold",
  },
  splitsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  splitsText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  avgText: {
    fontSize: 14,
    color: "#ccc",
  },
  mainButton: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#4ECDC4",
  },
  stopButton: {
    backgroundColor: Colors.hangColor,
  },
  completedButton: {
    backgroundColor: "#27AE60",
  },
  mainButtonText: {
    color: "#fff",
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
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
    marginBottom: 25,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: Colors.hangColor,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
