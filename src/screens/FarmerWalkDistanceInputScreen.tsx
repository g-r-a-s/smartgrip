import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
  Modal,
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
  const [showInfo, setShowInfo] = useState(false);

  // Add info button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="information-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

      {/* Info Modal */}
      <Modal
        visible={showInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfo(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Training Ground</Text>
            <Text style={styles.modalText}>
              This is your training ground where you build the foundation of
              your strength.{"\n\n"}
              Use this activity to get comfortable carrying weight while
              walking.{"\n\n"}
              Start light and gradually increase both weight and distance as you
              gain confidence.{"\n\n"}
              Focus on your core stability and arm strength - these are the
              building blocks for bigger challenges ahead.{"\n\n"}
              Master this, and you'll find other challenges much easier to
              tackle!
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.modalCloseText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  infoButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: Colors.farmerWalksColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCloseText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
