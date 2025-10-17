import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Colors from "../constants/colors";

// Array of motivational congratulations messages
const congratulationsMessages = [
  { title: "🎉 YOU MADE IT!", subtitle: "Way to go!" },
  { title: "🔥 INCREDIBLE!", subtitle: "You're on fire!" },
  { title: "💪 ABSOLUTE BEAST!", subtitle: "That's dedication!" },
  { title: "🚀 PHENOMENAL!", subtitle: "You crushed it!" },
  { title: "⭐ AMAZING WORK!", subtitle: "Keep it up!" },
  { title: "🏆 CHAMPION!", subtitle: "You're unstoppable!" },
  { title: "💎 DIAMOND HANDS!", subtitle: "Pure strength!" },
  { title: "🎯 BULLSEYE!", subtitle: "Perfect execution!" },
  { title: "🌟 SUPERSTAR!", subtitle: "You're shining!" },
  { title: "🔥 UNSTOPPABLE!", subtitle: "Nothing can stop you!" },
  { title: "💪 IRON WILL!", subtitle: "Mental toughness!" },
  { title: "🚀 TO THE MOON!", subtitle: "Sky's the limit!" },
  { title: "⭐ GOLD STANDARD!", subtitle: "You set the bar!" },
  { title: "🏅 MEDAL WORTHY!", subtitle: "Olympic level!" },
];

// Function to get a random congratulations message
const getRandomCongrats = () => {
  const randomIndex = Math.floor(
    Math.random() * congratulationsMessages.length
  );
  return congratulationsMessages[randomIndex];
};

interface CelebrationModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  details: string;
  buttonText?: string;
  onButtonPress: () => void;
  themeColor: string;
}

export default function CelebrationModal({
  visible,
  title,
  subtitle,
  details,
  buttonText = "View Progress",
  onButtonPress,
  themeColor,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState(() =>
    title && subtitle ? { title, subtitle } : getRandomCongrats()
  );

  useEffect(() => {
    if (visible) {
      // Reset states when modal becomes visible
      setShowConfetti(false);
      setShowMessage(false);
      setShowButton(false);

      // Generate new random message if no custom title/subtitle provided
      if (!title || !subtitle) {
        setCongratsMessage(getRandomCongrats());
      }

      // Start the celebration sequence
      setTimeout(() => setShowConfetti(true), 100);
      setTimeout(() => setShowMessage(true), 600);
      setTimeout(() => setShowButton(true), 1100);
    }
  }, [visible, title, subtitle]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.celebrationOverlay}>
        {showConfetti && (
          <ConfettiCannon
            count={150}
            colors={[
              Colors.dynamometerColor,
              Colors.farmerWalksColor,
              Colors.hangColor,
              Colors.attiaChallengeColor,
            ]}
            origin={{ x: 50, y: 10 }}
            fadeOut={true}
            autoStart={true}
            explosionSpeed={250}
            fallSpeed={2300}
          />
        )}

        <View style={styles.celebrationContent}>
          {showMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.celebrationTitle}>
                {congratsMessage.title}
              </Text>
              <Text style={[styles.celebrationSubtitle, { color: themeColor }]}>
                {congratsMessage.subtitle}
              </Text>
              <Text style={styles.celebrationDetails}>{details}</Text>
            </View>
          )}

          {showButton && (
            <TouchableOpacity
              style={[
                styles.viewProgressButton,
                { backgroundColor: themeColor },
              ]}
              onPress={onButtonPress}
            >
              <Text style={styles.viewProgressButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  celebrationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 1)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  celebrationContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 10,
  },
  celebrationSubtitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  celebrationDetails: {
    fontSize: 18,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  viewProgressButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  viewProgressButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
