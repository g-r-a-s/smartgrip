import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";

export default function TrainingGroundScreen() {
  const navigation = useNavigation();

  const handleHangPress = () => {
    // Navigate directly to HangTimeInput
    (navigation as any).navigate("HangTimeInput");
  };

  const handleFarmerWalksPress = () => {
    // Navigate directly to FarmerWalkDistanceInput
    (navigation as any).navigate("FarmerWalkDistanceInput");
  };

  const handleDynamometerPress = () => {
    // Navigate directly to DynamometerInput
    (navigation as any).navigate("DynamometerInput");
  };

  const exercises = [
    {
      id: "hang",
      title: "Hang for Time",
      description:
        "Build grip strength and endurance by hanging from a bar. Set your target time and track your progress with multiple sets and rest periods.",
      color: Colors.hangColor,
      onPress: handleHangPress,
    },
    {
      id: "farmer-walk",
      title: "Walk for Distance",
      description:
        "Improve grip strength and core stability by carrying weights while walking. Set your target distance and weight to challenge yourself.",
      color: Colors.farmerWalksColor,
      onPress: handleFarmerWalksPress,
    },
    {
      id: "dynamometer",
      title: "Dynamometer Test",
      description:
        "Measure your grip strength with a dynamometer. Test both hands separately to track your progress and identify imbalances.\nRequires a dynamometer device.\nIt's ok if you don't have one, you can still get plenty of data from the other activities.",
      color: Colors.dynamometerColor,
      onPress: handleDynamometerPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Training</Text>
      <Text style={styles.subtitle}>Build your strength and endurance</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.exerciseCard, { borderLeftColor: exercise.color }]}
            onPress={exercise.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseHeader}>
              <View
                style={[
                  styles.exerciseBadge,
                  { backgroundColor: exercise.color },
                ]}
              >
                <Text style={styles.exerciseBadgeText}>TRAINING</Text>
              </View>
            </View>

            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDescription}>
              {exercise.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  exerciseBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: Colors.lightGray,
    lineHeight: 20,
  },
});
