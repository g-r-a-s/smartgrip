/**
 * Activity domain types for SmartGrip
 */

export type ActivityType = "hang" | "farmer-walk" | "single-input";

export interface BaseActivity {
  id: string;
  userId: string;
  type: ActivityType;
  createdAt: Date;
  completedAt?: Date;
}

export interface HangActivity extends BaseActivity {
  type: "hang";
  duration: number; // in seconds
  notes?: string;
}

export interface FarmerWalkActivity extends BaseActivity {
  type: "farmer-walk";
  distance: number; // in meters
  weight: number; // in kg
  time: number; // in seconds
  notes?: string;
}

export interface SingleInputActivity extends BaseActivity {
  type: "single-input";
  value: number;
  unit: "seconds" | "kg" | "reps";
  description: string;
  notes?: string;
}

export type Activity = HangActivity | FarmerWalkActivity | SingleInputActivity;

export interface ActivitySession {
  id: string;
  userId: string;
  ActivityId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  data: Activity;
}

export interface UserStats {
  userId: string;
  totalActivities: number;
  totalSessions: number;
  bestHangTime?: number;
  bestFarmerWalkDistance?: number;
  lastActiveAt: Date;
  createdAt: Date;
}
