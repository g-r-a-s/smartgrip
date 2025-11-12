import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

const HERO_IMAGE = require("../../assets/illustrations/farmer-walk-challenge.png");

const sanitizeValue = (value: string, allowDecimal = false, maxLength = 4) => {
  const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
  const cleaned = value.replace(regex, "").slice(0, maxLength);
  if (!allowDecimal) {
    return cleaned;
  }
  const segments = cleaned.split(".");
  if (segments.length <= 2) return cleaned;
  const [first, ...rest] = segments;
  return `${first}.${rest.join("")}`;
};

type FarmerReadyRouteProp = RouteProp<RootStackParamList, "FarmerWalkReady">;
type FarmerReadyNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkReady"
>;

export default function FarmerWalkReadyScreen() {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<FarmerReadyNavigationProp>();
  const { params } = useRoute<FarmerReadyRouteProp>();

  const initialDistance = params?.distanceDisplay || "0";
  const initialWeight = params?.weightDisplay || "0";
  const units = params?.units || "metric";

  const distanceUnit = units === "metric" ? "m" : "yd";
  const weightUnit = units === "metric" ? "kg" : "lbs";

  const [distance, setDistance] = useState(() =>
    initialDistance.replace(/[^0-9.]/g, "")
  );
  const [weight, setWeight] = useState(() =>
    initialWeight.replace(/[^0-9.]/g, "")
  );

  const parsedDistance = useMemo(() => parseFloat(distance) || 0, [distance]);
  const parsedWeight = useMemo(() => parseFloat(weight) || 0, [weight]);

  const parseToMetric = (value: number, unit: "distance" | "weight") => {
    if (units === "metric") return value;
    if (unit === "distance") {
      return value / 1.09361;
    }
    return value / 2.20462;
  };

  const handleStart = () => {
    if (!parsedDistance || !parsedWeight) {
      Alert.alert("Set target", "Please enter distance and weight per hand.");
      return;
    }

    navigation.navigate("FarmerWalkDistance", {
      targetDistance: parseToMetric(parsedDistance, "distance"),
      leftHandWeight: parseToMetric(parsedWeight, "weight"),
      rightHandWeight: parseToMetric(parsedWeight, "weight"),
    });
  };

  const describeTarget = () => {
    if (!parsedDistance || !parsedWeight) return "Set your farmer walk goal";

    const distanceLabel = `${parsedDistance}${distanceUnit}`;
    const weightLabel = `${parsedWeight}${weightUnit}`;
    return `Carry ${weightLabel} per hand for ${distanceLabel}.`;
  };

  const isDisabled = !parsedDistance || !parsedWeight;

  return (
    <ImageBackground
      source={HERO_IMAGE}
      blurRadius={30}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.screen,
            { paddingTop: headerHeight + 12 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <Text style={styles.title}>Ready to Walk ?</Text>
            <Text style={styles.subtitle}>{describeTarget()}</Text>

            <View style={styles.inputsSection}>
              <View style={styles.customInputBlock}>
                <Text style={styles.customInputLabel}>
                  Distance ({distanceUnit})
                </Text>
                <TextInput
                  style={styles.customInput}
                  value={distance}
                  onChangeText={(value) =>
                    setDistance(sanitizeValue(value, false, 4))
                  }
                  keyboardType="number-pad"
                  placeholder={`0${distanceUnit}`}
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  maxLength={4}
                />
              </View>
              <View style={styles.customInputBlock}>
                <Text style={styles.customInputLabel}>
                  Weight per hand ({weightUnit})
                </Text>
                <TextInput
                  style={styles.customInput}
                  value={weight}
                  onChangeText={(value) =>
                    setWeight(sanitizeValue(value, true, 4))
                  }
                  keyboardType="decimal-pad"
                  placeholder={`0${weightUnit}`}
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.proTipContainer}>
              <Text style={styles.proTipText}>
                <Text style={styles.proTipHighlight}>💡 Pro tip:</Text> Stay
                tall, brace your core, and walk with controlled, even steps for
                maximum benefit.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isDisabled && styles.primaryButtonDisabled,
              ]}
              onPress={handleStart}
              disabled={isDisabled}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Start Farmer Walk</Text>
              <View style={styles.primaryButtonIcon}>
                <Ionicons name="play" size={20} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 14, 18, 0.6)",
  },
  screen: {
    paddingHorizontal: 24,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 40,
    gap: 28,
  },
  title: {
    marginTop: 36,
    fontSize: 40,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    textAlign: "center",
    lineHeight: 46,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Lufga-Regular",
    marginTop: 8,
  },
  proTipContainer: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  proTipText: {
    color: Colors.white,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Lufga-Regular",
  },
  proTipHighlight: {
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  inputsSection: {
    flexDirection: "row",
    width: "100%",
    gap: 18,
    marginTop: 36,
  },
  customInputBlock: {
    flex: 1,
  },
  customInputLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    fontFamily: "Lufga-Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  customInput: {
    width: "100%",
    height: 90,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    textAlign: "center",
    fontSize: 36,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    paddingHorizontal: 14,
  },
  primaryButton: {
    marginTop: 30,
    width: "100%",
    borderRadius: 50,
    paddingVertical: 10,
    paddingLeft: 28,
    paddingRight: 10,
    backgroundColor: Colors.accentGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Lufga-Bold",
  },
  primaryButtonIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
