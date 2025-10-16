import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { dataService } from "../services/dataService";
import { OnboardingData, OnboardingState } from "../types/onboarding";
import { CreateUserProfileData } from "../types/profile";
import { useAuth } from "./useAuth";

const ONBOARDING_STORAGE_KEY = "@smartgrip_onboarding";

export function useOnboarding() {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 0,
    data: {},
    isCompleted: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from storage on mount
  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOnboardingState(parsed);
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingState = async (state: OnboardingState) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
      setOnboardingState(state);
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    const completedState: OnboardingState = {
      currentStep: 0,
      data,
      isCompleted: true,
    };

    // Save locally first
    await saveOnboardingState(completedState);

    // Then sync to Firebase if user is authenticated
    if (user) {
      try {
        const profileData: CreateUserProfileData = {
          userId: user.uid,
          age: data.age,
          height: data.height,
          weight: data.weight,
          activityLevel: data.activityLevel,
          goals: data.goals,
          preferences: data.preferences,
        };

        await dataService.createUserProfile(profileData);
        console.log("Onboarding data synced to Firebase successfully");
      } catch (error) {
        console.error("Failed to sync onboarding data to Firebase:", error);
        // Don't throw error - local data is still saved
      }
    }
  };

  const resetOnboarding = async () => {
    const resetState: OnboardingState = {
      currentStep: 0,
      data: {},
      isCompleted: false,
    };
    await saveOnboardingState(resetState);
  };

  const updateOnboardingData = async (newData: Partial<OnboardingData>) => {
    const updatedState: OnboardingState = {
      ...onboardingState,
      data: { ...onboardingState.data, ...newData },
    };
    await saveOnboardingState(updatedState);
  };

  return {
    onboardingState,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    updateOnboardingData,
    isOnboardingCompleted: onboardingState.isCompleted,
    onboardingData: onboardingState.data as OnboardingData,
  };
}
