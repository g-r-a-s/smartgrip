import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { useData } from "../hooks/useData";
import { RootStackParamList } from "../navigation/StackNavigator";

type FarmerWalkDistanceInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkDistanceInput"
>;

export default function FarmerWalkDistanceInputScreen() {
  const navigation =
    useNavigation<FarmerWalkDistanceInputScreenNavigationProp>();
  const { userProfile } = useData();

  // Get user's unit preference
  const units = userProfile?.preferences?.units || "metric";
  const weightUnit = units === "metric" ? "kg" : "lbs";
  const defaultWeight = units === "metric" ? "5" : "11"; // 5kg ≈ 11lbs

  const [distance, setDistance] = useState("100");
  const [leftWeight, setLeftWeight] = useState(defaultWeight);
  const [rightWeight, setRightWeight] = useState(defaultWeight);
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
    const leftWeightNum = parseFloat(leftWeight);
    const rightWeightNum = parseFloat(rightWeight);

    if (!targetDistance || targetDistance <= 0) {
      alert("Please set a target distance greater than 0");
      return;
    }

    if (
      !leftWeightNum ||
      leftWeightNum < 0 ||
      !rightWeightNum ||
      rightWeightNum < 0
    ) {
      alert("Please set valid weights for both hands");
      return;
    }

    navigation.navigate("FarmerWalkDistance", {
      targetDistance,
      leftHandWeight: leftWeightNum,
      rightHandWeight: rightWeightNum,
    });
  };

  return (
    <>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          <Text style={styles.previewText}>Target: {distance}m</Text>

          {/* Weight Inputs */}
          <View style={styles.weightInputContainer}>
            <Text style={styles.weightLabel}>WEIGHT PER HAND</Text>
            <View style={styles.weightInputsRow}>
              <View style={styles.weightInputGroup}>
                <Text style={styles.handLabel}>LEFT</Text>
                <TextInput
                  style={styles.weightInput}
                  value={leftWeight}
                  onChangeText={setLeftWeight}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder={defaultWeight}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.weightUnit}>{weightUnit}</Text>
              </View>

              <View style={styles.weightInputGroup}>
                <Text style={styles.handLabel}>RIGHT</Text>
                <TextInput
                  style={styles.weightInput}
                  value={rightWeight}
                  onChangeText={setRightWeight}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder={defaultWeight}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <Text style={styles.weightUnit}>{weightUnit}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChallenge}
          >
            <Text style={styles.startButtonText}>START CHALLENGE</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
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
    marginBottom: 30,
  },
  weightInputContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  weightLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 15,
  },
  weightInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 300,
  },
  weightInputGroup: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  handLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
    fontWeight: "600",
  },
  weightInput: {
    backgroundColor: Colors.darkGray,
    color: Colors.text,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    width: 80,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  weightUnit: {
    fontSize: 12,
    color: Colors.gray,
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
