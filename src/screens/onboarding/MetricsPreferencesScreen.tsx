import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";

interface MetricsPreferencesScreenProps {
  initialUnits?: "metric" | "imperial";
  onNext: (preferences: { units: "metric" | "imperial" }) => void;
  onBack: () => void;
}

const METRICS_OPTIONS = [
  {
    value: "metric" as const,
    title: "Metric",
    description: "Kilograms, meters, centimeters",
    examples: "70 kg, 175 cm",
  },
  {
    value: "imperial" as const,
    title: "Imperial",
    description: "Pounds, feet, inches",
    examples: "154 lbs, 5'9\"",
  },
];

export default function MetricsPreferencesScreen({
  initialUnits,
  onNext,
  onBack,
}: MetricsPreferencesScreenProps) {
  const [selectedUnits, setSelectedUnits] = useState<"metric" | "imperial">(
    initialUnits || "metric"
  );

  const handleNext = () => {
    onNext({ units: selectedUnits });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Units of preferences</Text>
      </View>

      <View style={styles.optionsContainer}>
        {METRICS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              selectedUnits === option.value && styles.optionSelected,
            ]}
            onPress={() => setSelectedUnits(option.value)}
          >
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
            <Text style={styles.optionExamples}>{option.examples}</Text>
            {selectedUnits === option.value && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 24,
  },
  option: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.darkGray,
  },
  optionSelected: {
    borderColor: Colors.hangColor,
    backgroundColor: Colors.darkGray,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
    fontWeight: "500",
  },
  optionExamples: {
    fontSize: 14,
    color: "#CCCCCC",
    fontStyle: "italic",
  },
  selectedIndicator: {
    position: "absolute",
    right: 16,
    top: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.hangColor,
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
  backButtonText: {
    color: Colors.gray,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.hangColor,
    borderRadius: 12,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
