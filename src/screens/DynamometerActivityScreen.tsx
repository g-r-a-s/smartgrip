import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";
import { Colors } from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type DynamometerActivityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DynamometerActivity"
>;

interface DynamometerActivityScreenProps {
  navigation: DynamometerActivityScreenNavigationProp;
}

export default function DynamometerActivityScreen({
  navigation,
}: DynamometerActivityScreenProps) {
  const handleGripStrengthPress = () => {
    navigation.navigate("DynamometerInput");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dynamometer</Text>
      <Text style={styles.subtitle}>Test your grip strength</Text>

      <TouchableOpacity
        style={styles.challengeButton}
        onPress={handleGripStrengthPress}
      >
        <Text style={styles.challengeButtonText}>GRIP STRENGTH TEST</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 60,
    textAlign: "center",
  },
  challengeButton: {
    backgroundColor: Colors.dynamometerColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 300,
  },
  challengeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
