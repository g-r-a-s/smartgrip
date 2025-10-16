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
import { Colors } from "../../constants/colors";

interface GoalsScreenProps {
  initialGoals?: string;
  onNext: (goals: string) => void;
  onBack: () => void;
}

const SUGGESTED_GOALS = [
  "Build stronger grip strength for climbing",
  "Improve overall hand and forearm endurance",
  "Prepare for rock climbing competitions",
  "Recover from hand injury and rebuild strength",
  "General fitness and functional strength",
  "Martial arts training enhancement",
];

export default function GoalsScreen({
  initialGoals,
  onNext,
  onBack,
}: GoalsScreenProps) {
  const [goals, setGoals] = useState(initialGoals || "");
  const [isCustom, setIsCustom] = useState(
    initialGoals ? !SUGGESTED_GOALS.includes(initialGoals) : false
  );

  const handleNext = () => {
    if (goals.trim()) {
      onNext(goals.trim());
    }
  };

  const handleSuggestedGoal = (goal: string) => {
    setGoals(goal);
    setIsCustom(false);
  };

  const handleCustomInput = () => {
    setIsCustom(true);
    if (!goals || SUGGESTED_GOALS.includes(goals)) {
      setGoals("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>
          Tell us what you want to achieve with grip training
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!isCustom ? (
            <View style={styles.suggestedGoals}>
              <Text style={styles.sectionTitle}>Choose a goal:</Text>
              {SUGGESTED_GOALS.map((goal, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestedGoal,
                    goals === goal && styles.suggestedGoalSelected,
                  ]}
                  onPress={() => handleSuggestedGoal(goal)}
                >
                  <Text
                    style={[
                      styles.suggestedGoalText,
                      goals === goal && styles.suggestedGoalTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.customGoalButton}
                onPress={handleCustomInput}
              >
                <Text style={styles.customGoalButtonText}>
                  Write my own goal
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customInput}>
              <Text style={styles.sectionTitle}>Write your goal:</Text>
              <TextInput
                style={styles.textInput}
                value={goals}
                onChangeText={setGoals}
                placeholder="I want to build stronger grip for..."
                placeholderTextColor={Colors.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <Text style={styles.hint}>
                This can be edited later in your profile
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !goals.trim() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!goals.trim()}
        >
          <Text
            style={[
              styles.nextButtonText,
              !goals.trim() && styles.nextButtonTextDisabled,
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
  scrollView: {
    flex: 1,
  },
  content: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 16,
  },
  suggestedGoals: {
    marginBottom: 24,
  },
  suggestedGoal: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.darkGray,
  },
  suggestedGoalSelected: {
    borderColor: Colors.hangColor,
  },
  suggestedGoalText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 22,
  },
  suggestedGoalTextSelected: {
    color: Colors.hangColor,
  },
  customGoalButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderStyle: "dashed",
  },
  customGoalButtonText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    fontStyle: "italic",
  },
  customInput: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray,
    minHeight: 120,
    textAlignVertical: "top",
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
