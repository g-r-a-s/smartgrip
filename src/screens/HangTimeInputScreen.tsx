import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type HangTimeInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HangTimeInput"
>;

export default function HangTimeInputScreen() {
  const navigation = useNavigation<HangTimeInputScreenNavigationProp>();
  const [minutes, setMinutes] = useState("2");
  const [seconds, setSeconds] = useState("0");

  const handleStartChallenge = () => {
    const mins = parseInt(minutes || "0");
    const secs = parseInt(seconds || "0");
    const targetTime = mins * 60 + secs;

    if (targetTime <= 0) {
      alert("Please set a target time greater than 0");
      return;
    }

    navigation.navigate("HangStopwatch", { targetTime });
  };

  const formatTime = (time: string) => {
    return time.padStart(2, "0");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* <Text style={styles.description}>
        This is your training ground where you build the foundation of your
        hanging strength. {"\n\n"}
        Reach target time in one split or with breaks. {"\n"}
        You'll be able to pause the timer to take breaks when needed.
      </Text> */}

      <Text style={styles.mainTitle}>Reach target time</Text>
      <View style={styles.timeInputContainer}>
        <View style={styles.timeInputGroup}>
          <Text style={styles.timeLabel}>MINUTES</Text>
          <TextInput
            style={styles.timeInput}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="numeric"
            maxLength={2}
            placeholder="0"
          />
        </View>

        <Text style={styles.separator}>:</Text>

        <View style={styles.timeInputGroup}>
          <Text style={styles.timeLabel}>SECONDS</Text>
          <TextInput
            style={styles.timeInput}
            value={seconds}
            onChangeText={setSeconds}
            keyboardType="numeric"
            maxLength={2}
            placeholder="0"
          />
        </View>
      </View>

      <Text style={styles.previewText}>
        Target: {formatTime(minutes)}:{formatTime(seconds)}
      </Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartChallenge}
      >
        <Text style={styles.startButtonText}>START CHALLENGE</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 100,
    textAlign: "center",
    fontStyle: "italic",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 10,
  },
  timeInput: {
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#555",
  },
  separator: {
    fontSize: 48,
    color: "#fff",
    marginHorizontal: 20,
  },
  previewText: {
    fontSize: 18,
    color: "#4ECDC4",
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: Colors.hangColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
