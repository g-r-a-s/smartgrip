import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../constants/colors";

// Array of motivational messages for failures
const motivationalMessages = [
  { title: "CHALLENGE NOT MET", subtitle: "You're building strength!" },
  { title: "KEEP PRACTICING", subtitle: "Progress takes time!" },
  { title: "YOU GOT THIS", subtitle: "Every attempt makes you stronger!" },
  { title: "NOT THIS TIME", subtitle: "But you're getting closer!" },
  { title: "ALMOST THERE", subtitle: "Keep pushing forward!" },
  { title: "STRENGTH BUILDS", subtitle: "One session at a time!" },
];

// Function to get a random motivational message
const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
};

interface FailureModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  themeColor: string;
}

export default function FailureModal({
  visible,
  title,
  subtitle,
  message,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  themeColor,
}: FailureModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState(() =>
    title && subtitle ? { title, subtitle } : getRandomMessage()
  );

  useEffect(() => {
    if (visible) {
      // Reset states when modal becomes visible
      setShowContent(false);

      // Generate new random message if no custom title/subtitle provided
      if (!title || !subtitle) {
        setMotivationalMessage(getRandomMessage());
      }

      // Animate content in
      setTimeout(() => setShowContent(true), 200);
    }
  }, [visible, title, subtitle]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {showContent && (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="fitness-outline"
                  size={64}
                  color={themeColor}
                  style={styles.icon}
                />
              </View>

              {/* Title and Subtitle */}
              <View style={styles.messageContainer}>
                <Text style={styles.title}>{motivationalMessage.title}</Text>
                <Text style={[styles.subtitle, { color: themeColor }]}>
                  {motivationalMessage.subtitle}
                </Text>
                <Text style={styles.message}>{message}</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: themeColor }]}
                  onPress={onSecondaryPress}
                >
                  <Text
                    style={[styles.secondaryButtonText, { color: themeColor }]}
                  >
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: themeColor },
                  ]}
                  onPress={onPrimaryPress}
                >
                  <Text style={styles.primaryButtonText}>
                    {primaryButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.darkGray,
    borderRadius: 20,
    padding: 32,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#444",
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    opacity: 0.8,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    flex: 1,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginRight: 6,
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
