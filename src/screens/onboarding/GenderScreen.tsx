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
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your Attia Challenge targets
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
          <Text
            style={[
              styles.optionDescription,
              selectedGender === "male" && styles.optionDescriptionSelected,
            ]}
          >
            2-minute hang, body weight farmer walk
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
          <Text
            style={[
              styles.optionDescription,
              selectedGender === "female" && styles.optionDescriptionSelected,
            ]}
          >
            90-second hang, 75% body weight farmer walk
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedGender && styles.continueButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedGender}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: Colors.gray,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
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
    backgroundColor: Colors.attiaChallengeColor,
    borderColor: Colors.attiaChallengeColor,
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
  continueButton: {
    backgroundColor: Colors.attiaChallengeColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: Colors.darkGray,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
