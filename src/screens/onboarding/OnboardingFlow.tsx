import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";
import { OnboardingData, OnboardingState } from "../../types/onboarding";
import ActivityLevelScreen from "./ActivityLevelScreen";
import AgeScreen from "./AgeScreen";
import CarouselIntroScreen from "./CarouselIntroScreen";
import GenderScreen from "./GenderScreen";
import GoalsScreen from "./GoalsScreen";
import HeightWeightScreen from "./HeightWeightScreen";
import InspirationScreen from "./InspirationScreen";
import MetricsPreferencesScreen from "./MetricsPreferencesScreen";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    data: {},
    isCompleted: false,
  });

  const steps = [
    { component: CarouselIntroScreen, title: "Intro" },
    { component: AgeScreen, title: "Age" },
    { component: GenderScreen, title: "Gender" },
    { component: MetricsPreferencesScreen, title: "Units" },
    { component: HeightWeightScreen, title: "Height & Weight" },
    { component: ActivityLevelScreen, title: "Activity Level" },
    { component: GoalsScreen, title: "Goals" },
    { component: InspirationScreen, title: "Inspiration" },
  ];

  const updateData = (newData: Partial<OnboardingData>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  };

  const handleComplete = () => {
    setState((prev) => ({
      ...prev,
      isCompleted: true,
    }));

    // Complete the onboarding with all collected data
    onComplete(state.data as OnboardingData);
  };

  const renderCurrentStep = () => {
    const currentStepData = steps[state.currentStep];

    switch (state.currentStep) {
      case 0:
        return <CarouselIntroScreen onSkip={nextStep} onDone={nextStep} />;

      case 1:
        return (
          <GenderScreen
            initialGender={state.data.gender}
            onNext={(gender) => {
              updateData({ gender });
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 2:
        return (
          <MetricsPreferencesScreen
            initialUnits={state.data.preferences?.units}
            onNext={(preferences) => {
              updateData({ preferences });
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <HeightWeightScreen
            units={state.data.preferences?.units || "metric"}
            initialData={{
              height: state.data.height,
              weight: state.data.weight,
            }}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <ActivityLevelScreen
            initialLevel={state.data.activityLevel}
            onNext={(level) => {
              updateData({ activityLevel: level });
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <GoalsScreen
            initialGoals={state.data.goals}
            onNext={(goals) => {
              updateData({ goals });
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 6:
        return <InspirationScreen onComplete={handleComplete} />;

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderCurrentStep()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
});
