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

const formatDigits = (value: number) => value.toString().padStart(2, "0");

const describeTarget = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins && secs) {
    return `${mins} minute${mins > 1 ? "s" : ""} and ${secs} second${
      secs > 1 ? "s" : ""
    }`;
  }
  if (mins) {
    return `${mins} minute${mins > 1 ? "s" : ""}`;
  }
  return `${secs} second${secs !== 1 ? "s" : ""}`;
};

const sanitizeNumericInput = (value: string, maxLength = 2) => {
  return value.replace(/[^0-9]/g, "").slice(0, maxLength);
};

const BACKGROUND_IMAGE = require("../../assets/illustrations/hang-challenge-chose-level-illustration.png");

type HangReadyRouteProp = RouteProp<RootStackParamList, "HangReady">;
type HangReadyNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HangReady"
>;

export default function HangReadyScreen() {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<HangReadyNavigationProp>();
  const { params } = useRoute<HangReadyRouteProp>();

  const initialSeconds = params?.targetSeconds ?? 0;
  const initialMinutesPart = Math.floor(initialSeconds / 60);
  const initialSecondsPart = initialSeconds % 60;

  const [minutes, setMinutes] = useState(() =>
    initialMinutesPart > 0 ? formatDigits(initialMinutesPart) : ""
  );
  const [seconds, setSeconds] = useState(() =>
    initialSecondsPart > 0 ? formatDigits(initialSecondsPart) : ""
  );

  const preparedTargetSeconds = useMemo(() => {
    const mins = parseInt(minutes || "0", 10);
    const secs = parseInt(seconds || "0", 10);
    return mins * 60 + secs;
  }, [minutes, seconds]);

  const handleStart = () => {
    if (preparedTargetSeconds <= 0) {
      Alert.alert("Choose a time", "Please set a target greater than zero.");
      return;
    }

    navigation.navigate("HangStopwatch", { targetTime: preparedTargetSeconds });
  };

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      blurRadius={70}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
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
            <Text style={styles.title}>
              Ready to{"\n"}Start ?<Text style={styles.emoji}> 💪</Text>
            </Text>
            <Text style={styles.subtitle}>
              Hang for {describeTarget(preparedTargetSeconds || initialSeconds)}{" "}
              total to complete!
            </Text>

            <View style={styles.timerRow}>
              <View style={styles.timerCell}>
                <TextInput
                  value={minutes}
                  onChangeText={(value) =>
                    setMinutes(sanitizeNumericInput(value))
                  }
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={styles.timerInput}
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="rgba(26, 29, 31, 0.35)"
                />
                <Text style={styles.timerLabel}>Minutes</Text>
              </View>

              <Text style={styles.timerSeparator}>:</Text>

              <View style={styles.timerCell}>
                <TextInput
                  value={seconds}
                  onChangeText={(value) => {
                    const sanitized = sanitizeNumericInput(value);
                    if (sanitized === "") {
                      setSeconds("");
                      return;
                    }
                    const numeric = Math.min(parseInt(sanitized, 10), 59);
                    setSeconds(numeric.toString());
                  }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={styles.timerInput}
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="rgba(26, 29, 31, 0.35)"
                />
                <Text style={styles.timerLabel}>Seconds</Text>
              </View>
            </View>

            <View style={styles.proTipContainer}>
              <Text style={styles.proTipText}>
                <Text style={styles.proTipHighlight}>💡 Pro tip:</Text> Put your
                phone in your pocket for easy access in case you need to stop
                and take a break.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                preparedTargetSeconds <= 0 && styles.primaryButtonDisabled,
              ]}
              onPress={handleStart}
              disabled={preparedTargetSeconds <= 0}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Start Hanging Now</Text>
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
    flex: 1,
    paddingHorizontal: 24,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 32,
    marginTop: 12,
  },
  title: {
    fontSize: 42,
    fontFamily: "Lufga-Bold",
    textAlign: "center",
    color: Colors.white,
    marginTop: 32,
    lineHeight: 48,
  },
  emoji: {
    fontSize: 38,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    color: Colors.white,

    lineHeight: 22,
    fontFamily: "Lufga-Regular",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 38,
    gap: 18,
  },
  timerCell: {
    alignItems: "center",
  },
  timerInput: {
    width: 96,
    height: 110,
    borderRadius: 32,
    backgroundColor: "rgba(160, 164, 164, 0.12)",
    color: Colors.white,

    textAlign: "center",
    fontSize: 48,
    fontFamily: "Lufga-Bold",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timerLabel: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.white,

    fontFamily: "Lufga-Regular",
  },
  timerSeparator: {
    fontSize: 44,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  proTipContainer: {
    marginTop: 44,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  proTipText: {
    fontSize: 14,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Lufga-Regular",
  },
  proTipHighlight: {
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  primaryButton: {
    marginTop: 48,
    width: "100%",
    borderRadius: 50,
    paddingVertical: 8,
    backgroundColor: Colors.hangColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 8,
    shadowColor: Colors.hangColor,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Lufga-Bold",
  },
  primaryButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
