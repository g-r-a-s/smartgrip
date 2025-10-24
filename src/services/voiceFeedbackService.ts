import * as Speech from "expo-speech";

export type VoiceFeedbackType =
  | "start"
  | "progress"
  | "pause"
  | "success"
  | "countdown";

interface VoiceFeedbackOptions {
  remainingSeconds?: number;
}

class VoiceFeedbackService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;

  async initialize() {
    try {
      // Speech is available by default in expo-speech
      // No need to check availability
      console.log("Voice feedback initialized");
    } catch (error) {
      console.log("Error initializing voice feedback:", error);
      this.isEnabled = false;
    }
  }

  async playFeedback(type: VoiceFeedbackType, options?: VoiceFeedbackOptions) {
    if (!this.isEnabled || this.isSpeaking) return;

    try {
      if (type === "countdown") {
        const text = "Starting in 5 seconds, get ready!";
        console.log("Voice feedback:", text);

        this.isSpeaking = true;

        Speech.speak(text, {
          rate: 0.9,
          pitch: 1.0,
          volume: 0.8,
          language: "en-US",
        });

        setTimeout(() => {
          this.isSpeaking = false;
        }, 3000);
        return;
      }

      const text = this.getFeedbackText(type, options);
      console.log("Voice feedback:", text);

      this.isSpeaking = true;

      // Use a simpler approach without callbacks for better compatibility
      Speech.speak(text, {
        rate: 0.9, // Slightly slower for clarity
        pitch: 1.0,
        volume: 0.8,
        language: "en-US",
      });

      // Reset speaking state after a short delay
      setTimeout(() => {
        this.isSpeaking = false;
      }, 2000);
    } catch (error) {
      console.log("Error playing voice feedback:", error);
      this.isSpeaking = false;
    }
  }

  private getFeedbackText(
    type: VoiceFeedbackType,
    options?: VoiceFeedbackOptions
  ): string {
    switch (type) {
      case "start":
        return "Starting! Be strong!";
      case "progress":
        const remaining = options?.remainingSeconds || 0;
        return `Remaining ${remaining} seconds!`;
      case "pause":
        return "You paused, rest and get back to it!";
      case "success":
        return "Congratulations! You made it! That's a progress!";
      case "countdown":
        return "Starting in 5 seconds, get ready!";
      default:
        return "";
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  async cleanup() {
    // Stop any ongoing speech
    Speech.stop();
    this.isSpeaking = false;
  }
}

// Export singleton instance
export const voiceFeedback = new VoiceFeedbackService();
