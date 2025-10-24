import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const levels = [
    {
      id: "never",
      name: "Never Hung",
      time: "0:10",
      description: "First time trying",
    },
    {
      id: "beginner",
      name: "Beginner",
      time: "0:20",
      description: "Just getting started",
    },
    {
      id: "medium",
      name: "Medium",
      time: "0:45",
      description: "Some experience",
    },
    {
      id: "advanced",
      name: "Advanced",
      time: "1:00",
      description: "Strong grip",
    },
    {
      id: "custom",
      name: "Custom",
      time: "Custom",
      description: "Set your own time",
    },
  ];

  const handleLevelSelect = (level: any) => {
    setSelectedLevel(level.id);
    if (level.id !== "custom") {
      const [mins, secs] = level.time.split(":").map(Number);
      setMinutes(mins.toString());
      setSeconds(secs.toString());
    }
  };

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
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>SET YOUR TARGET TIME</Text>

          <Text style={styles.sectionTitle}>Choose Your Level</Text>
          <View style={styles.levelsContainer}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  selectedLevel === level.id && styles.levelCardSelected,
                ]}
                onPress={() => handleLevelSelect(level)}
              >
                <View style={styles.levelHeader}>
                  <Text
                    style={[
                      styles.levelName,
                      selectedLevel === level.id && styles.levelNameSelected,
                    ]}
                  >
                    {level.name}
                  </Text>
                  <Text
                    style={[
                      styles.levelTime,
                      selectedLevel === level.id && styles.levelTimeSelected,
                    ]}
                  >
                    {level.time}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.levelDescription,
                    selectedLevel === level.id &&
                      styles.levelDescriptionSelected,
                  ]}
                >
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedLevel === "custom" && (
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>MINUTES</Text>
                <TextInput
                  style={styles.timeInput}
                  value={minutes}
                  onChangeText={(text) => {
                    setMinutes(text);
                    setSelectedLevel("custom");
                  }}
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
                  onChangeText={(text) => {
                    setSeconds(text);
                    setSelectedLevel("custom");
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                />
              </View>
            </View>
          )}

          <Text style={styles.previewText}>
            Target: {formatTime(minutes)}:{formatTime(seconds)}
          </Text>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChallenge}
          >
            <Text style={styles.startButtonText}>START CHALLENGE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    marginTop: 20,
    textAlign: "center",
  },
  levelsContainer: {
    marginBottom: 20,
  },
  levelCard: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  levelCardSelected: {
    borderColor: Colors.hangColor,
    backgroundColor: "#444",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  levelNameSelected: {
    color: Colors.hangColor,
  },
  levelTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.hangColor,
  },
  levelTimeSelected: {
    color: "#fff",
  },
  levelDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  levelDescriptionSelected: {
    color: "#fff",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
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
