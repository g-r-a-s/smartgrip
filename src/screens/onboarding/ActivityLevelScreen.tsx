import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { ACTIVITY_LEVELS, ActivityLevel } from "../../types/onboarding";

interface ActivityLevelScreenProps {
  initialLevel?: ActivityLevel;
  onNext: (level: ActivityLevel) => void;
  onBack: () => void;
}

export default function ActivityLevelScreen({
  initialLevel,
  onNext,
  onBack,
}: ActivityLevelScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | null>(
    initialLevel || null
  );

  const handleNext = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your level of activity</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsContainer}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.option,
                selectedLevel === level.value && styles.optionSelected,
              ]}
              onPress={() => setSelectedLevel(level.value)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedLevel === level.value && styles.optionTitleSelected,
                  ]}
                >
                  {level.label}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    selectedLevel === level.value &&
                      styles.optionDescriptionSelected,
                  ]}
                >
                  {level.description}
                </Text>
              </View>
              {selectedLevel === level.value && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedLevel && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedLevel}
        >
          <Text
            style={[
              styles.nextButtonText,
              !selectedLevel && styles.nextButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
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
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
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
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.hangColor,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: Colors.lightGray,
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
