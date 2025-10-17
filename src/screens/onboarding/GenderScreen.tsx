import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/colors";

interface GenderScreenProps {
  initialGender?: "male" | "female";
  onNext: (gender: "male" | "female") => void;
  onBack: () => void;
}

export default function GenderScreen({
  initialGender,
  onNext,
  onBack,
}: GenderScreenProps) {
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(initialGender || null);

  const handleNext = () => {
    if (selectedGender) {
      onNext(selectedGender);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your challenges targets
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedGender === "male" && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedGender("male")}
        >
          <Text style={styles.optionEmoji}>♂️</Text>
          <Text
            style={[
              styles.optionText,
              selectedGender === "male" && styles.optionTextSelected,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedGender === "female" && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedGender("female")}
        >
          <Text style={styles.optionEmoji}>♀️</Text>
          <Text
            style={[
              styles.optionText,
              selectedGender === "female" && styles.optionTextSelected,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  optionButton: {
    backgroundColor: Colors.darkGray,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: Colors.hangColor,
    borderColor: Colors.hangColor,
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  optionTextSelected: {
    color: Colors.white,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: Colors.white,
  },
  footer: {
    paddingBottom: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.hangColor,
    borderRadius: 12,
    paddingVertical: 16,
  },
  backButtonText: {
    color: Colors.gray,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
