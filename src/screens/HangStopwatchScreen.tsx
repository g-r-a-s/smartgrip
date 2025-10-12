import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/StackNavigator";

type HangStopwatchScreenRouteProp = RouteProp<
  RootStackParamList,
  "HangStopwatch"
>;

export default function HangStopwatchScreen() {
  const route = useRoute<HangStopwatchScreenRouteProp>();
  const targetTime = route.params?.targetTime || 120; // default to 2 minutes if not provided

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

  // Check if target is completed
  useEffect(() => {
    if (completedTime >= targetTime && !isCompleted) {
      setIsCompleted(true);
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
