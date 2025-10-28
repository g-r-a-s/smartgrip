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
import { voiceFeedback } from "../services/voiceFeedbackService";
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

  // Initialize voice feedback
  useEffect(() => {
    voiceFeedback.initialize();
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (splitIntervalRef.current) {
        clearInterval(splitIntervalRef.current);
      }
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

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
  const [lastProgressFeedback, setLastProgressFeedback] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const splitIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add info button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          style={{ marginRight: 15 }}
        >
          <Ionicons
            name="information-circle-outline"
            size={28}
            color={Colors.themeColor}
          />
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

  const formatTargetTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) {
      return `${secs}s`;
    } else if (secs === 0) {
      return `${mins} min`;
    } else {
      return `${mins} min ${secs}s`;
    }
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

        // Check if target is reached during current split
        const totalTime = completedTime + elapsed;
        if (totalTime >= targetTime && !isCompleted) {
          // Target reached! Auto-complete the current split
          const finalSplit = {
            start: currentSplitStart,
            end: now,
            duration: elapsed,
          };

          setSplits((prev) => [...prev, finalSplit]);
          setCompletedTime((prev) => prev + finalSplit.duration);
          setCurrentSplitTime(0);
          setIsRunning(false);
          setIsCompleted(true);

          // Show celebration and play success feedback
          setShowCelebration(true);
          voiceFeedback.playFeedback("success");

          // Save data in background - pass the final split directly to ensure it's included
          saveSessionData(finalSplit);
          return;
        }

        // Voice feedback every 5 seconds
        if (
          elapsed > 0 &&
          elapsed % 5 === 0 &&
          elapsed !== lastProgressFeedback
        ) {
          const remaining = Math.max(0, targetTime - totalTime);
          voiceFeedback.playFeedback("progress", {
            remainingSeconds: remaining,
          });
          setLastProgressFeedback(elapsed);
        }
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
  const saveSessionData = async (additionalSplit?: {
    start: Date;
    end: Date;
    duration: number;
  }) => {
    if (!user || !sessionStartTime) return;

    try {
      console.log("💾 Saving session data...");
      console.log("Current splits state:", splits.length);
      console.log("Additional split:", additionalSplit);

      // Create Hang Activity
      const activity: Omit<HangActivity, "id" | "userId" | "createdAt"> = {
        type: "hang",
        targetTime,
      };

      const savedActivity = await createActivity(activity);

      if (!savedActivity || !savedActivity.id) {
        throw new Error("Failed to create activity - no ID returned");
      }

      // Combine existing splits with any additional split passed in
      // This handles the race condition where state hasn't updated yet
      const allSplits = additionalSplit ? [...splits, additionalSplit] : splits;

      // Also check if there's a current split that's still running
      let finalSplits = [...allSplits];
      if (currentSplitStart && currentSplitTime > 0 && !isCompleted) {
        const now = new Date();
        const finalSplit = {
          start: currentSplitStart,
          end: now,
          duration: currentSplitTime,
        };
        finalSplits.push(finalSplit);
        console.log("Adding final running split:", finalSplit);
      }

      console.log("Total splits to save:", finalSplits.length);
      console.log(
        "Splits data:",
        finalSplits.map((s) => ({ duration: s.duration }))
      );

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
      const sessionSplits: Split[] = finalSplits.map((split, index) => ({
        id: `split-${index}`,
        sessionId: savedSession.id, // Now we have the correct session ID
        startTime: split.start,
        endTime: split.end,
        value: split.duration,
        metric: "seconds" as const,
        isRest: false, // All splits are hang time, not rest
      }));

      console.log("Created session splits:", sessionSplits.length, "splits");
      console.log(
        "Split values:",
        sessionSplits.map((s) => s.value)
      );

      // Update session with the splits
      const updatedSession: Omit<ActivitySession, "id" | "userId"> = {
        ...savedSession,
        splits: sessionSplits,
      };

      await updateSession(savedSession.id, updatedSession);
      console.log(
        "✅ Session saved successfully with",
        sessionSplits.length,
        "splits"
      );
    } catch (error) {
      console.error("❌ Failed to save session:", error);
      Alert.alert(
        "Save Failed",
        "Could not save your session data. Please try again."
      );
    }
  };

  // Note: Target completion is now handled in real-time during the split timer
  // This useEffect is no longer needed as we detect completion immediately

  const handleStartStop = () => {
    if (!isRunning && !isCountingDown) {
      // Start countdown
      setIsCountingDown(true);
      setCountdown(5);

      // Play countdown announcement
      voiceFeedback.playFeedback("countdown");

      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Countdown finished, start the hang session
            setIsCountingDown(false);
            setIsRunning(true);
            setLastProgressFeedback(0);

            const now = new Date();
            if (!sessionStartTime) {
              setSessionStartTime(now);
            }
            setCurrentSplitStart(now);
            setCurrentSplitTime(0);

            // Voice feedback for start
            voiceFeedback.playFeedback("start");

            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
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

        // Voice feedback for pause (only if not completed)
        const newCompletedTime = completedTime + newSplit.duration;
        if (newCompletedTime < targetTime) {
          voiceFeedback.playFeedback("pause");
        }
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        isRunning && styles.containerRunning,
        isCompleted && styles.containerCompleted,
      ]}
    >
      <CelebrationModal
        visible={showCelebration}
        details={`You reached ${formatTime(targetTime)} in ${
          splits.length
        } split${splits.length > 1 ? "s" : ""}!`}
        buttonText="Play again!"
        themeColor={Colors.hangColor}
        onButtonPress={() => {
          setShowCelebration(false);
          // Navigate back to parent screen (Hang Time Input)
          navigation.goBack();
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
              🎯 Your goal: Hang for {formatTime(targetTime)} total time{"\n\n"}
              ⏱️ Start the timer when you begin hanging{"\n"}
              ⏸️ PAUSE when you need a break{"\n"}
              🔄 Rest and get back up there{"\n"}
              ▶️ RESTART when you're ready to continue{"\n\n"}
              💪 We track each hang session (split) and your total time{"\n\n"}
              📱 Pro tip: Keep your phone in your pocket for easy access{"\n\n"}
              📈 Watch your progress improve over time!
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
      <View
        style={[
          styles.targetContainer,
          isRunning && styles.targetContainerMinimized,
        ]}
      >
        <Text
          style={[styles.targetLabel, isRunning && styles.targetLabelMinimized]}
        >
          {isRunning ? "Target" : "Target Time"}
        </Text>
        <Text
          style={[styles.targetTime, isRunning && styles.targetTimeMinimized]}
        >
          {formatTime(targetTime)}
        </Text>
        <Text
          style={[
            styles.remainingText,
            isRunning && styles.remainingTextMinimized,
          ]}
        >
          Remaining: {formatTime(Math.max(0, targetTime - completedTime))}
        </Text>
        {!isRunning && (
          <Text style={styles.subtitleText}>
            Hang for {formatTargetTime(targetTime)} total to complete
          </Text>
        )}
      </View>

      {/* Current Hang Timer */}
      <View
        style={[
          styles.splitTimerContainer,
          isRunning && styles.splitTimerContainerActive,
        ]}
      >
        <Text
          style={[
            styles.targetLabel,
            isRunning && styles.currentTimerLabelActive,
          ]}
        >
          {isRunning ? "🔥 HANGING NOW!" : "Current Hang Time"}
        </Text>
        <Text style={[styles.splitTime, isRunning && styles.splitTimeActive]}>
          {formatTime(currentSplitTime)}
        </Text>

        {/* Progress Bar */}
        {isRunning && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      ((completedTime + currentSplitTime) / targetTime) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedTime + currentSplitTime < targetTime
                ? `${
                    targetTime - (completedTime + currentSplitTime)
                  }s to target!`
                : "Keep going! 💪"}
            </Text>
          </View>
        )}

        <Text
          style={[styles.subtitleText, isRunning && styles.subtitleTextActive]}
        >
          {splits.length === 0
            ? "Ready to crush your target? Let's GO! 🚀"
            : isRunning
            ? "PAUSE when you need a break, then RESTART when ready"
            : "Get back up there and start hanging!"}
        </Text>
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

      {/* Pro Tip */}
      <View style={styles.proTipContainer}>
        <Text style={styles.proTipText}>
          💡 Pro tip: Put your phone in your pocket for easy access in can you
          need to stop and take a break
        </Text>
      </View>

      {/* Main Action Button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          isRunning ? styles.stopButton : styles.startButton,
          isCompleted && styles.completedButton,
          !isRunning && !isCompleted && styles.startButtonPunchy,
        ]}
        onPress={handleStartStop}
        disabled={isCompleted || isCountingDown}
      >
        <Text
          style={[
            styles.mainButtonText,
            !isRunning &&
              !isCompleted &&
              !isCountingDown &&
              styles.startButtonTextPunchy,
          ]}
        >
          {isCompleted
            ? "🎉 CHALLENGE COMPLETED!"
            : isRunning
            ? "⏸️ PAUSE HANGING"
            : isCountingDown
            ? `⏰ ${countdown}`
            : "🚀 START HANGING NOW!"}
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
  containerRunning: {
    backgroundColor: "#0a0a0a",
  },
  containerCompleted: {
    backgroundColor: "#001a00",
  },
  targetContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  targetLabel: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 10,
    textAlign: "center",
  },
  targetTime: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  remainingText: {
    fontSize: 20,
    color: Colors.hangColor,
    fontWeight: "bold",
  },
  subtitleText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  proTipContainer: {
    backgroundColor: "rgba(187, 231, 60, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(187, 231, 60, 0.3)",
  },
  proTipText: {
    fontSize: 14,
    color: Colors.themeColor,
    textAlign: "center",
    fontWeight: "500",
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
    backgroundColor: Colors.hangColor,
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
  // State-based styles
  targetContainerMinimized: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
  targetLabelMinimized: {
    fontSize: 14,
  },
  targetTimeMinimized: {
    fontSize: 24,
  },
  remainingTextMinimized: {
    fontSize: 16,
  },
  splitTimerContainerActive: {
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.hangColor,
  },
  currentTimerLabelActive: {
    color: Colors.hangColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  splitTimeActive: {
    fontSize: 64,
    color: Colors.hangColor,
    textShadowColor: Colors.hangColor,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitleTextActive: {
    color: Colors.hangColor,
    fontWeight: "600",
  },
  // Progress bar styles
  progressBarContainer: {
    width: "100%",
    marginVertical: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.hangColor,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.hangColor,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  // Punchy start button styles
  startButtonPunchy: {
    backgroundColor: Colors.hangColor,
    borderWidth: 3,
    borderColor: Colors.hangColor,
    shadowColor: Colors.hangColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  startButtonTextPunchy: {
    color: "#000",
    fontWeight: "900",
    fontSize: 20,
  },
});
