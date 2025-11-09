import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CelebrationModal from "../components/CelebrationModal";
import ChallengeTimerCard from "../components/challenge/ChallengeTimerCard";
import FailureModal from "../components/FailureModal";
import Colors from "../constants/colors";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { voiceFeedback } from "../services/voiceFeedbackService";
import { AttiaChallengeActivity } from "../types/activities";

type AttiaChallengeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AttiaChallenge"
>;

interface AttiaChallengeScreenRouteParams {
  challengeType?: "hang" | "farmer-walk";
}

const challengeVisuals = {
  hang: {
    title: "Hang",
    subtitleMale: "2:00",
    subtitleFemale: "1:30",
    image: require("../../assets/illustrations/hanging.png"),
  },
  "farmer-walk": {
    title: "Farmer Walk",
    subtitle: (weight: number) => `${Math.round(weight)}kg × 1:00`,
    image: require("../../assets/illustrations/farmer-walk.png"),
  },
} as const;

export default function AttiaChallengeScreen() {
  const navigation = useNavigation<AttiaChallengeScreenNavigationProp>();
  const route = useRoute();
  const {
    createActivity,
    createSession,
    updateSession,
    deleteSession,
    userProfile,
  } = useData();

  const headerHeight = useHeaderHeight();

  const params = route.params as AttiaChallengeScreenRouteParams;
  const [selectedChallenge, setSelectedChallenge] = useState<
    "hang" | "farmer-walk"
  >(params?.challengeType || "hang");

  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownIntervalId, setCountdownIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [lastProgressFeedback, setLastProgressFeedback] = useState(0);
  const [savedActivityId, setSavedActivityId] = useState<string | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  // Get user's gender and weight for calculations
  const userGender = userProfile?.gender || "male"; // Default to male if not set
  const userWeight = userProfile?.weight || 70; // Default weight in kg

  // Calculate targets based on gender
  const getHangTarget = () => {
    return userGender === "male" ? 120 : 90; // 2 minutes for men, 90 seconds for women
  };

  const getFarmerWalkTarget = () => {
    return userGender === "male" ? userWeight : userWeight * 0.75; // Body weight for men, 75% for women
  };

  const currentTarget = selectedChallenge === "hang" ? getHangTarget() : 60; // 1 minute for farmer walk
  const currentBenchmark =
    selectedChallenge === "hang"
      ? userGender === "male"
        ? "2:00"
        : "1:30"
      : "1:00";

  // Initialize voice feedback
  useEffect(() => {
    voiceFeedback.initialize();

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
  }, []);

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      clearInterval(intervalId!);
      setIntervalId(null);
      setIsRunning(false);
      // If stopped before target, it's a failure
      if (timeElapsed < currentTarget) {
        handleFailure(timeElapsed);
      } else {
        handleSuccess(timeElapsed);
      }
    } else {
      // Start countdown before beginning challenge
      if (!isCountingDown) {
        setIsCountingDown(true);
        setCountdown(5);

        // Play countdown announcement
        voiceFeedback.playFeedback("countdown");

        // Countdown timer
        const countdownId = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              // Countdown finished, start the challenge
              setIsCountingDown(false);
              setTimeElapsed(0);
              setIsRunning(true);
              setLastProgressFeedback(0);

              // Voice feedback for start
              voiceFeedback.playFeedback("start");

              // Start main timer
              const id = setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
              }, 1000);
              setIntervalId(id);

              clearInterval(countdownId);
              setCountdownIntervalId(null);
              return 0;
            } else {
              return prev - 1;
            }
          });
        }, 1000);
        setCountdownIntervalId(countdownId);
      }
    }
  };

  const handleRepeatChallenge = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      setCountdownIntervalId(null);
    }
    setIsRunning(false);
    setIsCountingDown(false);
    setCountdown(0);
    setTimeElapsed(0);
    setLastProgressFeedback(0);
    setShowCelebration(false);
    setShowFailure(false);
  };

  const handleClose = () => {
    handleRepeatChallenge();
    navigation.goBack();
  };

  useEffect(() => {
    if (timeElapsed >= currentTarget && isRunning) {
      clearInterval(intervalId!);
      setIntervalId(null);
      setIsRunning(false);

      // Play success feedback
      voiceFeedback.playFeedback("success");

      handleSuccess(timeElapsed);
    }
  }, [timeElapsed, isRunning, intervalId, currentTarget]);

  // Voice feedback for progress (every 5 seconds)
  useEffect(() => {
    if (isRunning && timeElapsed > 0) {
      const remaining = Math.max(0, currentTarget - timeElapsed);

      // Play progress feedback every 5 seconds
      if (
        timeElapsed > 0 &&
        timeElapsed % 5 === 0 &&
        timeElapsed !== lastProgressFeedback &&
        remaining > 0
      ) {
        voiceFeedback.playFeedback("progress", {
          remainingSeconds: remaining,
        });
        setLastProgressFeedback(timeElapsed);
      }
    }
  }, [timeElapsed, isRunning, currentTarget, lastProgressFeedback]);

  const handleSuccess = async (finalTime: number) => {
    // Show celebration modal immediately (optimistic)
    setShowCelebration(true);

    // Save data in background (don't await)
    saveSuccessData(finalTime);
  };

  const saveSuccessData = async (finalTime: number) => {
    try {
      const activityData: Omit<
        AttiaChallengeActivity,
        "id" | "userId" | "createdAt"
      > = {
        type: "attia-challenge",
        attiaType: selectedChallenge,
        challengeType: "attia",
        benchmark: currentBenchmark,
      };

      if (selectedChallenge === "hang") {
        activityData.targetTime = getHangTarget();
      } else {
        activityData.targetDistance = 60; // 1 minute
        activityData.targetWeight = getFarmerWalkTarget();
      }

      const activity = await createActivity(activityData);
      setSavedActivityId(activity.id);

      const now = new Date();
      const startTime = new Date(Date.now() - finalTime * 1000);

      const session = await createSession({
        challengeId: activity.id,
        startTime: startTime,
        endTime: now,
        totalElapsedTime: finalTime,
        completed: true,
        splits: [
          {
            id: `split-${Date.now()}`,
            sessionId: "",
            startTime: startTime,
            endTime: now,
            value: finalTime,
            metric: "seconds",
            isRest: false,
          },
        ],
      });
      setSavedSessionId(session.id);

      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });
    } catch (error) {
      console.error("Failed to save successful challenge:", error);
    }
  };

  const handleDiscard = async () => {
    setShowCelebration(false);

    // Delete saved data if it exists
    if (savedSessionId) {
      try {
        await deleteSession(savedSessionId);
        console.log("✅ Session discarded");
      } catch (error) {
        console.error("Failed to discard session:", error);
      }
    }

    // Reset state
    setSavedActivityId(null);
    setSavedSessionId(null);
    setTimeElapsed(0);
    setIsRunning(false);

    // Navigate back
    navigation.goBack();
  };

  const handleViewDashboard = () => {
    setShowCelebration(false);
    // Navigate to Dashboard
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
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
  };

  const handleFailure = async (finalTime: number) => {
    const challengeName =
      selectedChallenge === "hang" ? "Hang Challenge" : "Farmer Walk Challenge";

    // Set failure message and show modal
    setFailureMessage(
      `You completed ${formatTime(
        finalTime
      )} of the Attia ${challengeName}. Keep practicing to reach the ${currentBenchmark} benchmark!`
    );
    setShowFailure(true);

    // Save data in background (don't await)
    saveFailureData(finalTime);
  };

  const saveFailureData = async (finalTime: number) => {
    try {
      const activityData: Omit<
        AttiaChallengeActivity,
        "id" | "userId" | "createdAt"
      > = {
        type: "attia-challenge",
        attiaType: selectedChallenge,
        challengeType: "attia",
        benchmark: currentBenchmark,
      };

      if (selectedChallenge === "hang") {
        activityData.targetTime = getHangTarget();
      } else {
        activityData.targetDistance = 60; // 1 minute
        activityData.targetWeight = getFarmerWalkTarget();
      }

      const activity = await createActivity(activityData);

      const now = new Date();
      const startTime = new Date(Date.now() - finalTime * 1000);

      const session = await createSession({
        challengeId: activity.id,
        startTime: startTime,
        endTime: now,
        totalElapsedTime: finalTime,
        completed: false,
        splits: [
          {
            id: `split-${Date.now()}`,
            sessionId: "",
            startTime: startTime,
            endTime: now,
            value: finalTime,
            metric: "seconds",
            isRest: false,
          },
        ],
      });

      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });
    } catch (error) {
      console.error("Failed to save failed challenge:", error);
    }
  };

  const remainingTime = Math.max(currentTarget - timeElapsed, 0);
  const displaySeconds = isRunning
    ? remainingTime
    : timeElapsed >= currentTarget && timeElapsed > 0
    ? 0
    : currentTarget;

  const getChallengeTitle = () => {
    if (selectedChallenge === "hang") {
      return `Hang Challenge (${currentBenchmark})`;
    }
    return `Farmer Walk Challenge (${currentBenchmark})`;
  };

  const getChallengeDescription = () => {
    if (selectedChallenge === "hang") {
      return `Hang for ${currentBenchmark} without letting go`;
    }
    return `Carry ${Math.round(
      getFarmerWalkTarget()
    )}kg for ${currentBenchmark}`;
  };

  return (
    <ImageBackground
      source={
        selectedChallenge === "hang"
          ? challengeVisuals.hang.image
          : challengeVisuals["farmer-walk"].image
      }
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <View
        style={[
          styles.container,
          {
            paddingTop: headerHeight + 12,
          },
        ]}
      >
        <CelebrationModal
          visible={showCelebration}
          details={`You completed the Attia ${
            selectedChallenge === "hang" ? "Hang" : "Farmer Walk"
          } Challenge in ${formatTime(timeElapsed)}!`}
          primaryButtonText="View Dashboard"
          secondaryButtonText="Discard"
          themeColor={Colors.attiaChallengeColor}
          onPrimaryPress={handleViewDashboard}
          onSecondaryPress={handleDiscard}
        />

        <FailureModal
          visible={showFailure}
          message={failureMessage}
          primaryButtonText="Try Again"
          secondaryButtonText="View Dashboard"
          themeColor={Colors.attiaChallengeColor}
          onPrimaryPress={() => {
            setShowFailure(false);
            // Clear any running interval
            if (intervalId) {
              clearInterval(intervalId);
              setIntervalId(null);
            }
            // Fully reset challenge state
            setTimeElapsed(0);
            setIsRunning(false);
          }}
          onSecondaryPress={() => {
            setShowFailure(false);
            // Navigate to Dashboard by resetting navigation stack to MainTabs with Dashboard selected
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.reset({
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
        />

        {/* Challenge Selection */}
        <View style={styles.challengeSelector}>
          <TouchableOpacity
            style={[
              styles.selectorChip,
              selectedChallenge === "hang" && styles.selectorChipActive,
            ]}
            onPress={() => {
              if (selectedChallenge !== "hang") {
                handleRepeatChallenge();
                setSelectedChallenge("hang");
              }
            }}
          >
            <Text style={styles.selectorLabel}>Hang</Text>
            <Text style={styles.selectorSubLabel}>
              {userGender === "male"
                ? challengeVisuals.hang.subtitleMale
                : challengeVisuals.hang.subtitleFemale}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectorChip,
              selectedChallenge === "farmer-walk" && styles.selectorChipActive,
            ]}
            onPress={() => {
              if (selectedChallenge !== "farmer-walk") {
                handleRepeatChallenge();
                setSelectedChallenge("farmer-walk");
              }
            }}
          >
            <Text style={styles.selectorLabel}>Farmer Walk</Text>
            <Text style={styles.selectorSubLabel}>
              {challengeVisuals["farmer-walk"].subtitle(getFarmerWalkTarget())}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        <View style={styles.timerSection}>
          <ChallengeTimerCard
            title={
              selectedChallenge === "hang" ? "Hang for time" : "Farmer walk"
            }
            subtitle={getChallengeTitle()}
            contextLabel="Training"
            accentColor={
              selectedChallenge === "hang"
                ? Colors.accentOrange
                : Colors.accentGreen
            }
            elapsedSeconds={timeElapsed}
            totalSeconds={currentTarget}
            displaySeconds={displaySeconds}
            isCountingDown={isCountingDown}
            countdownSeconds={countdown}
            onReset={handleRepeatChallenge}
            onClose={handleClose}
            onPrimaryAction={handleStartStop}
            primaryActionLabel={
              isCountingDown
                ? `Starting in ${countdown}s`
                : isRunning
                ? "Stop"
                : "Start"
            }
            primaryActionDisabled={isCountingDown}
            startLabel="0s"
            endLabel={
              selectedChallenge === "hang"
                ? formatTime(currentTarget)
                : `${Math.round(currentTarget)}s`
            }
          />
          {/* <Text style={styles.challengeDescriptionText}>
            {getChallengeDescription()}
          </Text> */}
        </View>

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
              <Text style={styles.modalTitle}>THE ATTIA CHALLENGE</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalHighlight}>Hang Challenge:</Text>
                {"\n"}• Men: 2:00 minutes dead hang
                {"\n"}• Women: 1:30 minutes dead hang
                {"\n\n"}
                <Text style={styles.modalHighlight}>
                  Farmer Walk Challenge:
                </Text>
                {"\n"}• Men: Carry body weight for 1:00 minute
                {"\n"}• Women: Carry 75% of body weight for 1:00 minute
                {"\n\n"}
                These challenges test:
                {"\n"}• Grip endurance & shoulder stability
                {"\n"}• Core strength & spinal health
                {"\n"}• Functional capacity for daily life
                {"\n\n"}
                This is a pass/fail challenge - either you can do it, or you
                can't.
                {"\n\n"}
                Start training with shorter durations and gradually build up.
                These challenges will show you exactly where your functional
                capacity stands.
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  challengeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  selectorChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectorChipActive: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.9)",
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  selectorSubLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
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
  challengeDescriptionText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
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
  modalHighlight: {
    fontWeight: "bold",
    color: Colors.attiaChallengeColor,
  },
  modalCloseButton: {
    backgroundColor: Colors.attiaChallengeColor,
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
