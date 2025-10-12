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

/**
 * Firestore service for managing training data
 * Handles CRUD operations for Activities, sessions, and user stats
 */
class FirestoreService {
  /**
   * Convert Firestore Timestamp to Date
   */
  private timestampToDate(timestamp: Timestamp | Date): Date {
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
      const ActivityRef = doc(collection(db, "Activities"));
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
      const ActivitiesRef = collection(db, "Activities");
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
  async getActivity(ActivityId: string): Promise<Activity | null> {
    try {
      const ActivityRef = doc(db, "Activities", ActivityId);
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
    ActivityId: string,
    updates: Partial<Activity>
  ): Promise<void> {
    try {
      const ActivityRef = doc(db, "Activities", ActivityId);
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
  async deleteActivity(ActivityId: string): Promise<void> {
    try {
      const ActivityRef = doc(db, "Activities", ActivityId);
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
        endTime: this.dateToTimestamp(newSession.endTime),
        data: {
          ...newSession.data,
          createdAt: this.dateToTimestamp(newSession.data.createdAt),
          completedAt: newSession.data.completedAt
            ? this.dateToTimestamp(newSession.data.completedAt)
            : undefined,
        },
      });

      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw new Error("Failed to create session");
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
          endTime: this.timestampToDate(data.endTime),
          data: {
            ...data.data,
            createdAt: this.timestampToDate(data.data.createdAt),
            completedAt: data.data.completedAt
              ? this.timestampToDate(data.data.completedAt)
              : undefined,
          },
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
}

// Export singleton instance
export const firestoreService = new FirestoreService();
