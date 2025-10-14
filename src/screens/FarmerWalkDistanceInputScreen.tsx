import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type FarmerWalkDistanceInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkDistanceInput"
>;

export default function FarmerWalkDistanceInputScreen() {
  const navigation =
    useNavigation<FarmerWalkDistanceInputScreenNavigationProp>();
  const [distance, setDistance] = useState("100");

  const handleStartChallenge = () => {
    const targetDistance = parseFloat(distance);

    if (!targetDistance || targetDistance <= 0) {
      alert("Please set a target distance greater than 0");
      return;
    }

    navigation.navigate("FarmerWalkDistance", { targetDistance });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SET TARGET DISTANCE</Text>

      <View style={styles.distanceInputContainer}>
        <Text style={styles.distanceLabel}>METERS</Text>
        <TextInput
          style={styles.distanceInput}
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
          maxLength={4}
          placeholder="100"
        />
      </View>

      <Text style={styles.previewText}>Target: {distance}m</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartChallenge}
      >
        <Text style={styles.startButtonText}>START CHALLENGE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 40,
  },
  distanceInputContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  distanceLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  distanceInput: {
    backgroundColor: Colors.darkGray,
    color: Colors.text,
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    width: 120,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewText: {
    fontSize: 18,
    color: Colors.farmerWalksColor,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: Colors.farmerWalksColor,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
});
