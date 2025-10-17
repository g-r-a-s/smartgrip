import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { AttiaChallengeActivity } from "../types/activities";

type AttiaChallengeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AttiaChallenge"
>;

interface AttiaChallengeScreenRouteParams {
  challengeType?: "hang" | "farmer-walk";
}

export default function AttiaChallengeScreen() {
  const navigation = useNavigation<AttiaChallengeScreenNavigationProp>();
  const route = useRoute();
  const { createActivity, createSession, updateSession, userProfile } =
    useData();

  const params = route.params as AttiaChallengeScreenRouteParams;
  const [selectedChallenge, setSelectedChallenge] = useState<
    "hang" | "farmer-walk"
  >(params?.challengeType || "hang");

  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

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
      setTimeElapsed(0);
      setIsRunning(true);
      const id = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    }
  };

  useEffect(() => {
    if (timeElapsed >= currentTarget && isRunning) {
      clearInterval(intervalId!);
      setIntervalId(null);
      setIsRunning(false);
      handleSuccess(timeElapsed);
    }
  }, [timeElapsed, isRunning, intervalId, currentTarget]);

  const handleSuccess = async (finalTime: number) => {
    // Show celebration modal immediately (optimistic)
    setShowCelebration(true);

    // Save data in background (don't await)
    saveSuccessData(finalTime);
  };

  const saveSuccessData = async (finalTime: number) => {
    try {
      console.log(
        `Creating successful Attia ${selectedChallenge} challenge...`
      );

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
      console.log("Activity created:", activity.id);

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

      console.log("Session created:", session.id);

      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });

      console.log("Success data saved successfully");
    } catch (error) {
      console.error("Failed to save successful challenge:", error);
    }
  };

  const handleFailure = async (finalTime: number) => {
    const challengeName =
      selectedChallenge === "hang" ? "Hang Challenge" : "Farmer Walk Challenge";

    // Show alert immediately
    Alert.alert(
      "Challenge Failed",
      `You completed ${formatTime(
        finalTime
      )} of the Attia ${challengeName}. Keep practicing to reach the ${currentBenchmark} benchmark!`,
      [
        {
          text: "Try Again",
          onPress: () => {
            setTimeElapsed(0);
            setIsRunning(false);
          },
        },
        {
          text: "View Progress",
          onPress: () => navigation.getParent()?.navigate("Progress"),
        },
      ]
    );

    // Save data in background (don't await)
    saveFailureData(finalTime);
  };

  const saveFailureData = async (finalTime: number) => {
    try {
      console.log(`Creating failed Attia ${selectedChallenge} challenge...`);

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
      console.log("Activity created:", activity.id);

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

      console.log("Session created:", session.id);

      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });

      console.log("Failure data saved successfully");
    } catch (error) {
      console.error("Failed to save failed challenge:", error);
    }
  };

  const progress = Math.min(1, timeElapsed / currentTarget);
  const remainingTime = currentTarget - timeElapsed;
  const displayTime = isRunning ? remainingTime : currentTarget;

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
    <View style={styles.container}>
      <CelebrationModal
        visible={showCelebration}
        details={`You completed the Attia ${
          selectedChallenge === "hang" ? "Hang" : "Farmer Walk"
        } Challenge in ${formatTime(timeElapsed)}!`}
        buttonText="View Progress"
        themeColor={Colors.attiaChallengeColor}
        onButtonPress={() => {
          setShowCelebration(false);
          navigation.getParent()?.navigate("Progress");
        }}
      />

      {/* Challenge Selection */}
      <View style={styles.challengeSelector}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            selectedChallenge === "hang" && styles.selectorButtonActive,
          ]}
          onPress={() => {
            setSelectedChallenge("hang");
            setTimeElapsed(0);
            setIsRunning(false);
            if (intervalId) {
              clearInterval(intervalId);
              setIntervalId(null);
            }
          }}
        >
          <Text style={styles.selectorEmoji}>🤸</Text>
          <Text
            style={[
              styles.selectorText,
              selectedChallenge === "hang" && styles.selectorTextActive,
            ]}
          >
            Hang
          </Text>
          <Text
            style={[
              styles.selectorSubtext,
              selectedChallenge === "hang" && styles.selectorSubtextActive,
            ]}
          >
            {userGender === "male" ? "2:00" : "1:30"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorButton,
            selectedChallenge === "farmer-walk" && styles.selectorButtonActive,
          ]}
          onPress={() => {
            setSelectedChallenge("farmer-walk");
            setTimeElapsed(0);
            setIsRunning(false);
            if (intervalId) {
              clearInterval(intervalId);
              setIntervalId(null);
            }
          }}
        >
          <Text style={styles.selectorEmoji}>🏋️</Text>
          <Text
            style={[
              styles.selectorText,
              selectedChallenge === "farmer-walk" && styles.selectorTextActive,
            ]}
          >
            Farmer Walk
          </Text>
          <Text
            style={[
              styles.selectorSubtext,
              selectedChallenge === "farmer-walk" &&
                styles.selectorSubtextActive,
            ]}
          >
            {Math.round(getFarmerWalkTarget())}kg × 1:00
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.challengeTitle}>{getChallengeTitle()}</Text>
        <Text style={styles.challengeDescription}>
          {getChallengeDescription()}
        </Text>

        <Text style={styles.timerText}>{formatTime(displayTime)}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>
      </View>

      {/* Start/Stop Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.startButton, isRunning && styles.stopButton]}
          onPress={handleStartStop}
        >
          <Text style={styles.startButtonText}>
            {isRunning ? "STOP" : "START"}
          </Text>
        </TouchableOpacity>
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
              <Text style={styles.modalHighlight}>Farmer Walk Challenge:</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: 20,
  },
  challengeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
    marginTop: 20,
  },
  selectorButton: {
    backgroundColor: Colors.darkGray,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 0.45,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectorButtonActive: {
    backgroundColor: Colors.attiaChallengeColor,
    borderColor: Colors.attiaChallengeColor,
  },
  selectorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 4,
  },
  selectorTextActive: {
    color: Colors.white,
  },
  selectorSubtext: {
    fontSize: 12,
    color: Colors.gray,
  },
  selectorSubtextActive: {
    color: Colors.white,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  challengeDescription: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 40,
    textAlign: "center",
  },
  timerText: {
    fontSize: 80,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 40,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: Colors.darkGray,
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.attiaChallengeColor,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: Colors.attiaChallengeColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  stopButton: {
    backgroundColor: Colors.attiaChallengeColor,
  },
  startButtonText: {
    color: Colors.white,
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
