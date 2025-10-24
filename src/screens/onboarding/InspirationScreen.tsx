import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";

interface InspirationScreenProps {
  onComplete: () => void;
}

const INSPIRATION_TEXT = [
  "Grip",
  "the first movement we make",
  "the last we want to lose",
  "this app helps you cultivate it",
  "in body and mind",
];

export default function InspirationScreen({
  onComplete,
}: InspirationScreenProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Simple typewriter effect
    const typeNextLine = () => {
      if (currentLine < INSPIRATION_TEXT.length) {
        const currentText = INSPIRATION_TEXT[currentLine];
        let charIndex = 0;

        const typeInterval = setInterval(() => {
          if (charIndex <= currentText.length) {
            setDisplayedText(currentText.substring(0, charIndex));
            charIndex++;
          } else {
            clearInterval(typeInterval);

            // Move to next line after a pause
            setTimeout(() => {
              if (currentLine < INSPIRATION_TEXT.length - 1) {
                setCurrentLine((prev) => prev + 1);
                setDisplayedText("");
              } else {
                // All done, show button
                setIsTyping(false);
                setShowButton(true);
              }
            }, 300);
          }
        }, 80);
      }
    };

    typeNextLine();
  }, [currentLine]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <View style={styles.singleLineContainer}>
            <Text style={styles.line}>
              {displayedText}
              {isTyping && "|"}
            </Text>
          </View>
        </View>

        {showButton && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={onComplete}
            >
              <Text style={styles.completeButtonText}>Begin Your Journey</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 10,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginBottom: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  singleLineContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  line: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 38,
    textAlign: "center",
    fontWeight: "700",
    opacity: 1,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 40,
  },
  completeButton: {
    borderWidth: 3,
    borderColor: Colors.themeColor,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    shadowColor: Colors.themeColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonText: {
    color: Colors.themeColor,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
