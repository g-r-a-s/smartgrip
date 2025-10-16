export interface OnboardingData {
  age: number;
  height: number; // in cm or inches based on units
  weight: number; // in kg or lbs based on units
  activityLevel: ActivityLevel;
  goals: string;
  preferences: {
    units: "metric" | "imperial";
  };
}

export type ActivityLevel =
  | "sedentary"
  | "lightly-active"
  | "moderately-active"
  | "very-active"
  | "extremely-active";

export interface OnboardingState {
  currentStep: number;
  data: Partial<OnboardingData>;
  isCompleted: boolean;
}

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise, desk job",
  },
  {
    value: "lightly-active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    value: "moderately-active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    value: "very-active",
    label: "Very Active",
    description: "Heavy exercise 6-7 days/week",
  },
  {
    value: "extremely-active",
    label: "Extremely Active",
    description: "Very heavy exercise, physical job",
  },
];
