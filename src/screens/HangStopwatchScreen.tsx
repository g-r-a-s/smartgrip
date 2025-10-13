import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const targetTime = route.params?.targetTime || 120; // default to 2 minutes if not provided
  const { user } = useAuth();
  const { createActivity, createSession, updateSession } = useData();

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
      console.log("Starting to save session data...");

      // Create Hang Activity
      const activity: Omit<HangActivity, "id" | "userId" | "createdAt"> = {
        type: "hang",
        targetTime,
      };

      console.log("Creating activity:", activity);
      const savedActivity = await createActivity(activity);
      console.log("Activity created successfully:", savedActivity);

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

      console.log("Creating session:", tempSession);
      const savedSession = await createSession(tempSession);
      console.log("Session created successfully:", savedSession);

      // Now create splits with correct sessionId
      const sessionSplits: Split[] = splits.map((split, index) => ({
        id: `split-${index}`,
        sessionId: savedSession.id, // Now we have the correct session ID
        startTime: split.start,
        endTime: split.end,
        duration: split.duration,
        isRest: false, // All splits are hang time, not rest
      }));

      // Update session with the splits
      const updatedSession: Omit<ActivitySession, "id" | "userId"> = {
        ...savedSession,
        splits: sessionSplits,
      };

      console.log("Updating session with splits:", updatedSession);
      await updateSession(savedSession.id, updatedSession);
      console.log("Session saved successfully!");
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
      saveSessionData(); // Save data when completed
      Alert.alert(
        "🎉 Challenge Completed!",
        `You reached ${formatTime(targetTime)} in ${splits.length} splits!`
      );
    }
  }, [completedTime, targetTime, splits.length, isCompleted]);

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
    color: "#FF6B35",
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
    backgroundColor: "#FF6B35",
  },
  completedButton: {
    backgroundColor: "#27AE60",
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
