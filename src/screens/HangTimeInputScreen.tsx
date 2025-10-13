import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
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
    <View style={styles.container}>
      <Text style={styles.title}>SET TARGET TIME</Text>

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
