import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { useOnboarding } from "../hooks/useOnboarding";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { userProfile } = useData();
  const { resetOnboarding } = useOnboarding();

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset your onboarding and show it again. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert(
                "Success",
                "Onboarding has been reset. Restart the app to see it again."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to reset onboarding");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {userProfile && (
        <View style={styles.storyContainer}>
          <Text style={styles.storyTitle}>Your Fitness Story</Text>

          <View style={styles.storySection}>
            <Text style={styles.storyText}>
              You're{" "}
              <Text style={styles.highlight}>{userProfile.age} years old</Text>{" "}
              and
              {userProfile.height && userProfile.weight ? (
                <>
                  {" "}
                  stand at{" "}
                  <Text style={styles.highlight}>
                    {userProfile.height}{" "}
                    {userProfile.preferences?.units === "metric"
                      ? "cm"
                      : "inches"}
                  </Text>{" "}
                  tall, weighing{" "}
                  <Text style={styles.highlight}>
                    {userProfile.weight}{" "}
                    {userProfile.preferences?.units === "metric" ? "kg" : "lbs"}
                  </Text>
                  .
                </>
              ) : (
                " have set your physical stats."
              )}
            </Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storyText}>
              You're{" "}
              <Text style={styles.highlight}>
                {userProfile.activityLevel?.replace("-", " ")}
              </Text>
            </Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storyText}>
              Your main goal:{" "}
              <Text style={styles.highlight}>"{userProfile.goals}"</Text>
            </Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storyText}>
              You prefer{" "}
              <Text style={styles.highlight}>
                {userProfile.preferences?.units === "metric"
                  ? "metric"
                  : "imperial"}
              </Text>{" "}
              units for measurements.
            </Text>
          </View>

          <View style={styles.storyFooter}>
            <Text style={styles.storyDate}>
              Profile created: {user?.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* Temporary Reset Onboarding Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetOnboarding}
      >
        <Text style={styles.resetButtonText}>Reset Onboarding (Dev)</Text>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  storyContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#333",
    maxWidth: 350,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  storySection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  storyText: {
    fontSize: 16,
    color: "#e0e0e0",
    lineHeight: 24,
    textAlign: "left",
  },
  highlight: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  storyFooter: {
    marginTop: 8,
    alignItems: "center",
  },
  storyDate: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  infoSection: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 12,
    maxWidth: 300,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
