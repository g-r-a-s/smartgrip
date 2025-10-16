export interface UserProfile {
  id: string; // Same as userId
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Onboarding data
  age?: number;
  gender?: "male" | "female";
  height?: number; // in cm or inches based on units
  weight?: number; // in kg or lbs based on units
  activityLevel?: string;
  goals?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  units: "metric" | "imperial";
}

export interface CreateUserProfileData {
  userId: string;
  age?: number;
  gender?: "male" | "female";
  height?: number;
  weight?: number;
  activityLevel?: string;
  goals?: string;
  preferences?: UserPreferences;
}

export interface UpdateUserProfileData {
  age?: number;
  gender?: "male" | "female";
  height?: number;
  weight?: number;
  activityLevel?: string;
  goals?: string;
  preferences?: UserPreferences;
}
