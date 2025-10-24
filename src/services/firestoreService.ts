import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Activity, ActivitySession, UserStats } from "../types/activities";
import {
  CreateUserProfileData,
  UpdateUserProfileData,
  UserProfile,
} from "../types/profile";

/**
 * Firestore service for managing training data
 * Handles CRUD operations for Activities, sessions, and user stats
 */
class FirestoreService {
  /**
   * Convert Firestore Timestamp to Date
   */
  private timestampToDate(timestamp: Timestamp | Date | null): Date {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    return timestamp.toDate();
  }

  /**
   * Convert Date to Firestore Timestamp
   */
  private dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  // ============ Activities ============

  /**
   * Create a new Activity
   */
  async createActivity(
    userId: string,
    Activity: Omit<Activity, "id" | "userId" | "createdAt">
  ): Promise<Activity> {
    try {
      const ActivityRef = doc(collection(db, "activities"));
      const newActivity = {
        ...Activity,
        id: ActivityRef.id,
        userId,
        createdAt: new Date(),
      } as Activity;

      await setDoc(ActivityRef, {
        ...newActivity,
        createdAt: serverTimestamp(),
      });

      return newActivity;
    } catch (error) {
      console.error("Failed to create Activity:", error);
      throw new Error("Failed to create Activity");
    }
  }

  /**
   * Get all Activities for a user
   */
  async getUserActivities(userId: string): Promise<Activity[]> {
    try {
      const ActivitiesRef = collection(db, "activities");
      const q = query(
        ActivitiesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const Activities: Activity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        Activities.push({
          ...data,
          createdAt: this.timestampToDate(data.createdAt),
          completedAt: data.completedAt
            ? this.timestampToDate(data.completedAt)
            : undefined,
        } as Activity);
      });

      return Activities;
    } catch (error) {
      console.error("Failed to get user Activities:", error);
      throw new Error("Failed to get Activities");
    }
  }

  /**
   * Get a specific Activity
   */
  async getActivity(activityId: string): Promise<Activity | null> {
    try {
      const ActivityRef = doc(db, "activities", activityId);
      const ActivitySnap = await getDoc(ActivityRef);

      if (!ActivitySnap.exists()) return null;

      const data = ActivitySnap.data();
      return {
        ...data,
        createdAt: this.timestampToDate(data.createdAt),
        completedAt: data.completedAt
          ? this.timestampToDate(data.completedAt)
          : undefined,
      } as Activity;
    } catch (error) {
      console.error("Failed to get Activity:", error);
      throw new Error("Failed to get Activity");
    }
  }

  /**
   * Update a Activity
   */
  async updateActivity(
    activityId: string,
    updates: Partial<Activity>
  ): Promise<void> {
    try {
      const ActivityRef = doc(db, "activities", activityId);
      const updateData: any = { ...updates };

      // Convert Date fields to Timestamps
      if (updates.createdAt)
        updateData.createdAt = this.dateToTimestamp(updates.createdAt);
      if (updates.completedAt)
        updateData.completedAt = this.dateToTimestamp(updates.completedAt);

      await updateDoc(ActivityRef, updateData);
    } catch (error) {
      console.error("Failed to update Activity:", error);
      throw new Error("Failed to update Activity");
    }
  }

  /**
   * Delete a Activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const ActivityRef = doc(db, "activities", activityId);
      await deleteDoc(ActivityRef);
    } catch (error) {
      console.error("Failed to delete Activity:", error);
      throw new Error("Failed to delete Activity");
    }
  }

  // ============ SESSIONS ============

  /**
   * Create a new Activity session
   */
  async createSession(
    userId: string,
    session: Omit<ActivitySession, "id" | "userId">
  ): Promise<ActivitySession> {
    try {
      const sessionRef = doc(collection(db, "sessions"));
      const newSession: ActivitySession = {
        ...session,
        id: sessionRef.id,
        userId,
      };

      await setDoc(sessionRef, {
        ...newSession,
        startTime: this.dateToTimestamp(newSession.startTime),
        endTime: newSession.endTime
          ? this.dateToTimestamp(newSession.endTime)
          : undefined,
      });

      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw new Error("Failed to create session");
    }
  }

  /**
   * Update an existing session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<ActivitySession>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const updateData: any = { ...updates };

      // Convert Date fields to Timestamps
      if (updates.startTime)
        updateData.startTime = this.dateToTimestamp(updates.startTime);
      if (updates.endTime)
        updateData.endTime = this.dateToTimestamp(updates.endTime);

      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error("Failed to update session:", error);
      throw new Error("Failed to update session");
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "sessions", sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw new Error("Failed to delete session");
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(
    userId: string,
    limitCount: number = 50
  ): Promise<ActivitySession[]> {
    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        orderBy("startTime", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions: ActivitySession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          ...data,
          startTime: this.timestampToDate(data.startTime),
          endTime: data.endTime
            ? this.timestampToDate(data.endTime)
            : undefined,
        } as ActivitySession);
      });

      return sessions;
    } catch (error) {
      console.error("Failed to get user sessions:", error);
      throw new Error("Failed to get sessions");
    }
  }

  // ============ USER STATS ============

  /**
   * Get or create user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const statsRef = doc(db, "userStats", userId);
      const statsSnap = await getDoc(statsRef);

      if (statsSnap.exists()) {
        const data = statsSnap.data();
        return {
          ...data,
          lastActiveAt: this.timestampToDate(data.lastActiveAt),
          createdAt: this.timestampToDate(data.createdAt),
        } as UserStats;
      }

      // Create new stats if they don't exist
      const newStats: UserStats = {
        userId,
        totalActivities: 0,
        totalSessions: 0,
        totalChallenges: 0,
        lastActiveAt: new Date(),
        createdAt: new Date(),
      };

      await setDoc(statsRef, {
        ...newStats,
        lastActiveAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      return newStats;
    } catch (error) {
      console.error("Failed to get user stats:", error);
      throw new Error("Failed to get user stats");
    }
  }

  /**
   * Update user stats
   */
  async updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<void> {
    try {
      const statsRef = doc(db, "userStats", userId);
      const updateData: any = { ...updates };

      // Convert Date fields to Timestamps
      if (updates.lastActiveAt)
        updateData.lastActiveAt = this.dateToTimestamp(updates.lastActiveAt);
      if (updates.createdAt)
        updateData.createdAt = this.dateToTimestamp(updates.createdAt);

      await updateDoc(statsRef, updateData);
    } catch (error) {
      console.error("Failed to update user stats:", error);
      throw new Error("Failed to update user stats");
    }
  }

  /**
   * Create or update user profile
   */
  async createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
    try {
      const profileRef = doc(db, "profiles", data.userId);

      const profileData = {
        id: data.userId,
        userId: data.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null,
        activityLevel: data.activityLevel || null,
        goals: data.goals || null,
        preferences: data.preferences || null,
      };

      await setDoc(profileRef, profileData, { merge: true });

      return {
        id: data.userId,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        age: data.age,
        height: data.height,
        weight: data.weight,
        activityLevel: data.activityLevel,
        goals: data.goals,
        preferences: data.preferences,
      };
    } catch (error) {
      console.error("Failed to create user profile:", error);
      throw new Error("Failed to create user profile");
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return null;
      }

      const data = profileSnap.data();
      return {
        ...data,
        id: data.id,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw new Error("Failed to get user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<void> {
    try {
      const profileRef = doc(db, "profiles", userId);

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(profileRef, updateData);
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      const profileRef = doc(db, "profiles", userId);
      await deleteDoc(profileRef);
    } catch (error) {
      console.error("Failed to delete user profile:", error);
      throw new Error("Failed to delete user profile");
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
