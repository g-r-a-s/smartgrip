import { useEffect } from "react";
import {
  voiceFeedback,
  VoiceFeedbackOptions,
  VoiceFeedbackType,
} from "../services/voiceFeedbackService";

export const useVoiceFeedback = () => {
  useEffect(() => {
    // Initialize voice feedback when hook is used
    voiceFeedback.initialize();
  }, []);

  const playFeedback = (
    type: VoiceFeedbackType,
    options?: VoiceFeedbackOptions
  ) => {
    voiceFeedback.playFeedback(type, options);
  };

  const setEnabled = (enabled: boolean) => {
    voiceFeedback.setEnabled(enabled);
  };

  const isEnabled = () => {
    return voiceFeedback.isVoiceEnabled();
  };

  return {
    playFeedback,
    setEnabled,
    isEnabled,
  };
};
