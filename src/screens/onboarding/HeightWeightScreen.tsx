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
import { Colors } from "../../constants/colors";

interface HeightWeightScreenProps {
  units: "metric" | "imperial";
  initialData?: { height?: number; weight?: number };
  onNext: (data: { height: number; weight: number }) => void;
  onBack: () => void;
}

export default function HeightWeightScreen({
  units,
  initialData,
  onNext,
  onBack,
}: HeightWeightScreenProps) {
  // Set default values based on units
  const defaultHeight = units === "metric" ? "175" : "5.7"; // cm vs feet (5'7" = 5.7)
  const defaultWeight = units === "metric" ? "70" : "154"; // kg vs lbs

  const [height, setHeight] = useState(
    initialData?.height?.toString() || defaultHeight
  );
  const [weight, setWeight] = useState(
    initialData?.weight?.toString() || defaultWeight
  );

  const handleNext = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum > 0 && weightNum > 0) {
      onNext({ height: heightNum, weight: weightNum });
    }
  };

  const isValid = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    return heightNum > 0 && weightNum > 0;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tell us about yourself</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder={units === "metric" ? defaultHeight : "5.7"}
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>{units === "metric" ? "cm" : "ft"}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder={defaultWeight}
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>{units === "metric" ? "kg" : "lbs"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !isValid() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid()}
        >
          <Text
            style={[
              styles.nextButtonText,
              !isValid() && styles.nextButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 48,
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
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: Colors.white,
    paddingVertical: 16,
    fontWeight: "500",
  },
  unit: {
    fontSize: 16,
    color: Colors.gray,
    marginLeft: 8,
  },
  hint: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    fontStyle: "italic",
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
  nextButtonDisabled: {
    backgroundColor: Colors.darkGray,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  nextButtonTextDisabled: {
    color: Colors.gray,
  },
});
