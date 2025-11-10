import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CelebrationModal from "../components/CelebrationModal";
import ChallengeTimerCard from "../components/challenge/ChallengeTimerCard";
import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { voiceFeedback } from "../services/voiceFeedbackService";
import { ActivitySession, HangActivity, Split } from "../types/activities";

const HANG_HERO_IMAGE = require("../../assets/illustrations/hanging.png");

type HangStopwatchScreenRouteProp = RouteProp<
  RootStackParamList,
  "HangStopwatch"
>;

export default function HangStopwatchScreen() {
  const route = useRoute<HangStopwatchScreenRouteProp>();
  const navigation = useNavigation();
  const targetTime = route.params?.targetTime || 120; // default to 2 minutes if not provided
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const { createActivity, createSession, updateSession, deleteSession } =
    useData();
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

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
      setSavedSessionId(savedSession.id);

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

  const handleResetSession = () => {
    if (splitIntervalRef.current) {
      clearInterval(splitIntervalRef.current);
      splitIntervalRef.current = null;
    }
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setIsRunning(false);
    setIsCountingDown(false);
    setCountdown(0);
    setCurrentSplitStart(null);
    setCurrentSplitTime(0);
    setCompletedTime(0);
    setSessionStartTime(null);
    setSessionElapsedTime(0);
    setSplits([]);
    setLastProgressFeedback(0);
    setIsCompleted(false);
    setShowCelebration(false);
    setSavedSessionId(null);
  };

  const handleCloseSession = () => {
    handleResetSession();
    navigation.goBack();
  };

  const totalElapsedSeconds =
    completedTime + (isRunning ? currentSplitTime : 0);
  const displaySeconds = isRunning ? currentSplitTime : totalElapsedSeconds;

  return (
    <View style={styles.screen}>
      <CelebrationModal
        visible={showCelebration}
        details={`You reached ${formatTime(targetTime)} in ${
          splits.length
        } split${splits.length > 1 ? "s" : ""}!`}
        primaryButtonText="View Dashboard"
        secondaryButtonText="Discard"
        themeColor={Colors.hangColor}
        onPrimaryPress={() => {
          setShowCelebration(false);
          setTimeout(() => {
            (navigation as any).dispatch(
              require("@react-navigation/native").CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: "MainTabs",
                    params: {
                      screen: "Dashboard",
                    },
                  },
                ],
              })
            );
          }, 100);
        }}
        onSecondaryPress={async () => {
          setShowCelebration(false);
          if (savedSessionId) {
            try {
              await deleteSession(savedSessionId);
              console.log("✅ Session discarded");
            } catch (error) {
              console.error("Failed to discard session:", error);
            }
          }
          setSavedSessionId(null);
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

      <ImageBackground
        source={HANG_HERO_IMAGE}
        style={[styles.heroImage, { paddingTop: headerHeight + 32 }]}
        imageStyle={styles.heroImageInner}
      >
        <View style={styles.timerSection}>
          <ChallengeTimerCard
            title="Hang for time"
            subtitle={`Target ${formatTime(targetTime)}`}
            contextLabel="Training"
            accentColor={Colors.accentOrange}
            elapsedSeconds={Math.min(totalElapsedSeconds, targetTime)}
            totalSeconds={targetTime}
            displaySeconds={displaySeconds}
            isCountingDown={isCountingDown}
            countdownSeconds={countdown}
            onPrimaryAction={handleStartStop}
            primaryActionLabel={
              isCompleted
                ? "Completed"
                : isCountingDown
                ? `Starting in ${countdown}s`
                : isRunning
                ? "Pause"
                : "Start"
            }
            primaryActionDisabled={isCountingDown || isCompleted}
            onReset={handleResetSession}
            onClose={handleCloseSession}
            startLabel="0s"
            endLabel={formatTime(targetTime)}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0e0f12",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  heroImageInner: {
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sessionLabel: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 16,
    fontFamily: "Lufga-Bold",
  },
  heroCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Lufga-Bold",
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
    fontFamily: "Lufga-Regular",
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
    fontFamily: "Lufga-Bold",
  },
  timerSection: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 24,
    marginTop: "auto",
    paddingBottom: 16,
  },
});
