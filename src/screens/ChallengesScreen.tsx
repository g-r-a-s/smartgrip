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

export default function ChallengesScreen() {
  const navigation = useNavigation();

  const handleAttiaHangPress = () => {
    // Navigate directly to AttiaChallenge
    (navigation as any).navigate("AttiaChallenge", { challengeType: "hang" });
  };

  const handleAttiaFarmerWalkPress = () => {
    // Navigate directly to AttiaChallenge
    (navigation as any).navigate("AttiaChallenge", {
      challengeType: "farmer-walk",
    });
  };

  const challenges = [
    {
      id: "attia-hang",
      title: "Attia Hang Challenge",
      description:
        "Test your grip strength and endurance. Hang for 2 minutes (men) or 90 seconds (women) to pass this benchmark challenge.",
      color: Colors.attiaChallengeColor,
      onPress: handleAttiaHangPress,
    },
    {
      id: "attia-farmer-walk",
      title: "Attia Farmer Walk Challenge",
      description:
        "Challenge your grip and core stability. Walk for 1 minute carrying your body weight (men) or 75% body weight (women).",
      color: Colors.attiaChallengeColor,
      onPress: handleAttiaFarmerWalkPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges</Text>
      <Text style={styles.subtitle}>
        Test yourself against proven benchmarks
      </Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {challenges.map((challenge) => (
          <TouchableOpacity
            key={challenge.id}
            style={[styles.challengeCard, { borderLeftColor: challenge.color }]}
            onPress={challenge.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.challengeHeader}>
              <View
                style={[
                  styles.challengeBadge,
                  { backgroundColor: challenge.color },
                ]}
              >
                <Text style={styles.challengeBadgeText}>CHALLENGE</Text>
              </View>
            </View>

            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>
              {challenge.description}
            </Text>
          </TouchableOpacity>
        ))}

        {/* New section at bottom */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonText}>
            More tests are on their way!
          </Text>
        </View>
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
  challengeCard: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  challengeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  challengeBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.lightGray,
    lineHeight: 20,
  },
  comingSoonCard: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.themeColor,
    marginBottom: 24,
  },
  comingSoonText: {
    color: Colors.themeColor,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
