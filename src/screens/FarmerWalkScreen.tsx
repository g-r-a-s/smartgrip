import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CelebrationModal from "../components/CelebrationModal";
import FarmerWalkProgressCard from "../components/challenge/FarmerWalkProgressCard";
import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { FarmerWalkActivity } from "../types/activities";

const HERO_IMAGE = require("../../assets/illustrations/farmer-walk-challenge.png");

const sanitizeDistanceInput = (value: string) => value.replace(/[^0-9.]/g, "");

const formatMeters = (value: number) => `${Math.max(Math.round(value), 0)}m`;

const formatWeight = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}kg`;
};

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
  const headerHeight = useHeaderHeight();

  const targetDistance = route.params?.targetDistance || 100;
  const leftHandWeight = route.params?.leftHandWeight || 5;
  const rightHandWeight = route.params?.rightHandWeight || 5;
  const { user } = useAuth();
  const { createActivity, createSession, updateSession, deleteSession } =
    useData();

  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [splits, setSplits] = useState<
    Array<{ start: Date; end: Date; value: number }>
  >([]);
  const [currentSplitDistance, setCurrentSplitDistance] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const totalDistance = useMemo(
    () => splits.reduce((sum, split) => sum + split.value, 0),
    [splits]
  );

  const handleStartSession = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
  };

  const handleResetSession = () => {
    setSessionStartTime(null);
    setSplits([]);
    setCurrentSplitDistance("");
    setIsCompleted(false);
    setShowCelebration(false);
    setSavedSessionId(null);
  };

  const handleCloseSession = () => {
    handleResetSession();
    navigation.goBack();
  };

  const handleAddSplit = () => {
    const sanitizedValue = sanitizeDistanceInput(currentSplitDistance);
    const distance = parseFloat(sanitizedValue);

    if (!distance || distance <= 0) {
      Alert.alert(
        "Invalid distance",
        "Please enter a distance greater than zero before adding a split."
      );
      return;
    }

    handleStartSession();

    const now = new Date();
    const split = { start: now, end: now, value: distance };
    setSplits((prev) => [...prev, split]);
    setCurrentSplitDistance("");
  };

  useEffect(() => {
    if (totalDistance >= targetDistance && !isCompleted && splits.length > 0) {
      setIsCompleted(true);
      setShowCelebration(true);
      saveSessionData();
    }
  }, [totalDistance, targetDistance, isCompleted, splits]);

  const saveSessionData = async () => {
    if (!user || !sessionStartTime || splits.length === 0) return;

    try {
      const activity = await createActivity({
        type: "farmer-walk",
        targetDistance,
        leftHandWeight,
        rightHandWeight,
      } as Omit<FarmerWalkActivity, "id" | "userId" | "createdAt">);

      const session = await createSession({
        challengeId: activity.id,
        startTime: sessionStartTime,
        endTime: new Date(),
        totalElapsedTime: 0,
        completed: true,
        splits: splits.map((split) => ({
          id: `split-${Date.now()}-${Math.random()}`,
          sessionId: "",
          startTime: split.start,
          endTime: split.end,
          value: split.value,
          metric: "meters",
          isRest: false,
        })),
      });
      setSavedSessionId(session.id);

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
            color={Colors.white}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <CelebrationModal
        visible={showCelebration}
        details={`You walked ${formatMeters(targetDistance)} in ${
          splits.length
        } split${splits.length > 1 ? "s" : ""}!`}
        primaryButtonText="View Dashboard"
        secondaryButtonText="Discard"
        themeColor={Colors.farmerWalksColor}
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
            } catch (error) {
              console.error("Failed to discard session:", error);
            }
          }
          setSavedSessionId(null);
          navigation.goBack();
        }}
      />

      <ImageBackground
        source={HERO_IMAGE}
        style={styles.heroImage}
        imageStyle={styles.heroImageInner}
      >
        <View style={styles.heroOverlay} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: headerHeight + 32,
              paddingBottom: 36,
              paddingHorizontal: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.timerSection}>
              <FarmerWalkProgressCard
                coveredDistance={totalDistance}
                targetDistance={targetDistance}
                weightPerHand={leftHandWeight}
                onReset={handleResetSession}
                onClose={handleCloseSession}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputTitle}>Log a distance</Text>
              <Text style={styles.inputHint}>
                Each time you rest, log how far you walked with the weights.
              </Text>
              <TextInput
                style={styles.distanceInput}
                value={currentSplitDistance}
                onChangeText={(value) =>
                  setCurrentSplitDistance(sanitizeDistanceInput(value))
                }
                keyboardType="decimal-pad"
                placeholder="e.g. 25"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSplit}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Distance</Text>
              </TouchableOpacity>
            </View>

            {splits.length > 0 ? (
              <View style={styles.splitsCard}>
                <Text style={styles.splitsTitle}>Logged distances</Text>
                {splits
                  .slice()
                  .reverse()
                  .map((split, index) => (
                    <View key={index} style={styles.splitRow}>
                      <Text style={styles.splitIndex}>
                        #{splits.length - index}
                      </Text>
                      <Text style={styles.splitValue}>
                        {formatMeters(split.value)}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      <Modal visible={showInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How the farmer walk works</Text>
            <Text style={styles.modalText}>
              Start the session, walk with your weights, and log each distance
              when you put them down. Keep adding splits until you reach your
              target.
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
  screen: {
    flex: 1,
    backgroundColor: "#0e0f12",
  },
  heroImage: {
    flex: 1,
  },
  heroImageInner: {
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.35)",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sessionLabel: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: "rgba(255, 255, 255, 0.85)",
  },
  heroCloseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  timerSection: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 28,
  },
  // summaryRow: {
  //   flexDirection: "row",
  //   gap: 16,
  //   marginBottom: 24,
  // },
  // summaryCard: {
  //   flex: 1,
  //   borderRadius: 20,
  //   paddingVertical: 14,
  //   paddingHorizontal: 18,
  //   backgroundColor: "rgba(255, 255, 255, 0.15)",
  //   borderWidth: 1,
  //   borderColor: "rgba(255, 255, 255, 0.25)",
  // },
  // summaryLabel: {
  //   fontSize: 13,
  //   fontFamily: "Lufga-Regular",
  //   color: "rgba(255, 255, 255, 0.75)",
  //   marginBottom: 6,
  // },
  // summaryValue: {
  //   fontSize: 18,
  //   fontFamily: "Lufga-Bold",
  //   color: Colors.white,
  // },
  inputCard: {
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 24,
  },
  inputTitle: {
    fontSize: 18,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  inputHint: {
    fontSize: 13,
    fontFamily: "Lufga-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 18,
  },
  distanceInput: {
    width: "100%",
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    color: Colors.white,
    fontSize: 28,
    fontFamily: "Lufga-Bold",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: Colors.farmerWalksColor,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Lufga-Bold",
  },
  splitsCard: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  splitsTitle: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
  },
  splitIndex: {
    fontSize: 14,
    fontFamily: "Lufga-Regular",
    color: "rgba(255, 255, 255, 0.65)",
  },
  splitValue: {
    fontSize: 16,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "rgba(18, 20, 24, 0.95)",
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Lufga-Regular",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.farmerWalksColor,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Lufga-Bold",
  },
});
