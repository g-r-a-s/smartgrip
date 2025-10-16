/**
 * Activity domain types for SmartGrip
 * Activities are the main categories (Hang, Farmer Walks, Dynamometer)
 */

export type ActivityType =
  | "hang"
  | "farmer-walk"
  | "dynamometer"
  | "attia-challenge";

export interface BaseActivity {
  id: string;
  userId: string;
  type: ActivityType;
  createdAt: Date;
  completedAt?: Date;
}

export type ActivityMetric = "seconds" | "meters" | "kg" | "lbs";

export interface HangActivity extends BaseActivity {
  type: "hang";
  targetTime: number; // in seconds - the goal time (e.g., 120 for 2 minutes)
  notes?: string;
}

export interface FarmerWalkActivity extends BaseActivity {
  type: "farmer-walk";
  targetDistance: number; // in meters
  leftHandWeight: number; // in kg or lbs based on user preferences
  rightHandWeight: number; // in kg or lbs based on user preferences
  notes?: string;
}

export interface DynamometerActivity extends BaseActivity {
  type: "dynamometer";
  leftHandValue: number; // measurement value
  rightHandValue: number; // measurement value
  // unit: "kg" | "lbs";
  // hand: "left" | "right" | "both";
  notes?: string;
}

export interface AttiaChallengeActivity extends BaseActivity {
  type: "attia-challenge";
  attiaType: "hang" | "farmer-walk"; // Which part of the Attia challenge
  targetTime?: number; // For hang: 120 seconds (male) or 90 seconds (female)
  targetDistance?: number; // For farmer walk: in meters
  targetWeight?: number; // For farmer walk: body weight (male) or 75% body weight (female)
  challengeType: "attia";
  benchmark: string; // "2:00" or "1:30" for hang, "1:00" for farmer walk
  notes?: string;
}

export type Activity =
  | HangActivity
  | FarmerWalkActivity
  | DynamometerActivity
  | AttiaChallengeActivity;

/**
 * Challenge types - specific challenges within activities
 * For example: "Hang for 2 minutes" is a challenge within the Hang activity
 */
export type ChallengeType = "hang-for-time";

export interface BaseChallenge {
  id: string;
  userId: string;
  activityId: string; // Links to the parent activity
  type: ChallengeType;
  targetTime: number; // in seconds
  createdAt: Date;
  completedAt?: Date;
}

export interface HangForTimeChallenge extends BaseChallenge {
  type: "hang-for-time";
  targetTime: number;
  notes?: string;
}

export type Challenge = HangForTimeChallenge;

/**
 * Session represents one attempt at a challenge
 * Contains multiple splits (individual attempts)
 */
export interface ActivitySession {
  id: string;
  userId: string;
  challengeId: string;
  startTime: Date; // When user first started the session
  endTime?: Date; // When challenge was completed
  totalElapsedTime?: number; // Total time from start to completion (in seconds)
  totalValue?: number; // Total value achieved (sum of all split values)
  metric?: ActivityMetric;
  completed: boolean;
  splits: Split[];
}

/**
 * Split represents one individual attempt within a session
 */
export interface Split {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  value: number; // the measured value (seconds, meters, kg, etc.)
  metric: ActivityMetric;
  isRest: boolean; // true if this is rest time between attempts
}

export interface UserStats {
  userId: string;
  totalActivities: number;
  totalSessions: number;
  totalChallenges: number;
  bestHangTime?: number;
  bestFarmerWalkDistance?: number;
  lastActiveAt: Date;
  createdAt: Date;
}
