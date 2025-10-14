import { Ionicons } from "@expo/vector-icons";
import React, { useLayoutEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";
import { Colors } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";
import { DynamometerActivity } from "../types/activities";

type DynamometerInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DynamometerInput"
>;

export default function DynamometerInputScreen({
  navigation,
}: {
  navigation: DynamometerInputScreenNavigationProp;
}) {
  const { user } = useAuth();
  const { createActivity, createSession, updateSession } = useData();

  const [showInfo, setShowInfo] = useState(false);
  const [leftHandValue, setLeftHandValue] = useState("");
  const [rightHandValue, setRightHandValue] = useState("");

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
            color={Colors.text}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSaveResults = async () => {
    const leftValue = parseFloat(leftHandValue);
    const rightValue = parseFloat(rightHandValue);

    if (!leftValue || leftValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid left hand value");
      return;
    }

    if (!rightValue || rightValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid right hand value");
      return;
    }

    if (!user) {
      Alert.alert("Error", "Please log in to save your results");
      return;
    }

    try {
      // Create dynamometer activity
      const activity = await createActivity({
        type: "dynamometer",
        leftHandValue: leftValue,
        rightHandValue: rightValue,
      } as Omit<DynamometerActivity, "id" | "userId" | "createdAt">);

      // Create session with both hand measurements
      const now = new Date();
      const session = await createSession({
        challengeId: activity.id,
        startTime: now,
        endTime: now,
        totalElapsedTime: 0,
        completed: true,
        splits: [
          {
            id: `left-${Date.now()}`,
            sessionId: "",
            startTime: now,
            endTime: now,
            value: leftValue,
            metric: "kg" as const,
            isRest: false,
          },
          {
            id: `right-${Date.now()}`,
            sessionId: "",
            startTime: now,
            endTime: now,
            value: rightValue,
            metric: "kg" as const,
            isRest: false,
          },
        ],
      });

      // Update session with correct sessionId for splits
      await updateSession(session.id, {
        splits: session.splits.map((split) => ({
          ...split,
          sessionId: session.id,
        })),
      });

      Alert.alert(
        "Results Saved!",
        `Left: ${leftValue} kg, Right: ${rightValue} kg`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to save results:", error);
      Alert.alert("Error", "Failed to save your results. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Left Hand (kg)</Text>
        <TextInput
          style={styles.valueInput}
          value={leftHandValue}
          onChangeText={setLeftHandValue}
          placeholder="Enter value"
          placeholderTextColor={Colors.gray}
          keyboardType="numeric"
          autoFocus
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Right Hand (kg)</Text>
        <TextInput
          style={styles.valueInput}
          value={rightHandValue}
          onChangeText={setRightHandValue}
          placeholder="Enter value"
          placeholderTextColor={Colors.gray}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveResults}>
        <Text style={styles.saveButtonText}>SAVE RESULTS</Text>
      </TouchableOpacity>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grip Strength Test</Text>
            <Text style={styles.modalText}>
              Measure your grip strength for both hands using a dynamometer.
              {"\n\n"}
              Enter the maximum force achieved for each hand in kilograms.
              {"\n\n"}
              We'll track your progress over time!
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
  inputContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 20,
    color: Colors.white,
    marginBottom: 15,
    fontWeight: "bold",
  },
  valueInput: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 24,
    color: Colors.white,
    textAlign: "center",
    width: 150,
  },
  saveButton: {
    backgroundColor: Colors.dynamometerColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 40,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: Colors.dynamometerColor,
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
