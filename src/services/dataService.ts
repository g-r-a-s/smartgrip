import { CACHE_DURATION, STORAGE_KEYS } from "../constants/storage";
import { Activity, ActivitySession, UserStats } from "../types/activities";
import { OfflineAction } from "../types/storage";
import { firestoreService } from "./firestoreService";
import { storageService } from "./storageService";

/**
 * Data service that combines Firestore with AsyncStorage caching
 * Provides offline-first data access with automatic synchronization
 */
class DataService {
  private isOnline = true;
  private offlineQueue: OfflineAction[] = [];

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.processOfflineQueue();
    }
  }

  /**
   * Get Activities for user (cache-first, then network)
   */
  async getUserActivities(
    userId: string,
    forceRefresh = false
  ): Promise<Activity[]> {
    const cacheKey = `${STORAGE_KEYS.USER_ACTIVITIES}_${userId}`;

    try {
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedActivities = await storageService.getItem<Activity[]>(
          cacheKey,
          CACHE_DURATION.ACTIVITIES
        );
        if (cachedActivities) {
          return cachedActivities;
        }
      }

      // Fetch from network if online
      if (this.isOnline) {
        const Activities = await firestoreService.getUserActivities(userId);
        await storageService.setItem(cacheKey, Activities);
        return Activities;
      }

      // Return stale cache if offline
      const staleActivities = await storageService.getItem<Activity[]>(
        cacheKey
      );
      return staleActivities || [];
    } catch (error) {
      console.error("Failed to get user Activities:", error);

      // Return stale cache on error
      const staleActivities = await storageService.getItem<Activity[]>(
        cacheKey
      );
      return staleActivities || [];
    }
  }

  /**
   * Create a new Activity
   */
  async createActivity(
    userId: string,
    Activity: Omit<Activity, "id" | "userId" | "createdAt">
  ): Promise<Activity> {
    try {
      if (this.isOnline) {
        // Create directly in Firestore
        const newActivity = await firestoreService.createActivity(
          userId,
          Activity
        );

        // Update cache
        await this.updateActivitiesCache(userId);

        return newActivity;
      } else {
        // Add to offline queue
        const offlineAction: OfflineAction = {
          id: Date.now().toString(),
          type: "CREATE",
          collection: "Activities",
          documentId: "", // Will be set when syncing
          data: { userId, ...Activity },
          timestamp: new Date(),
        };

        await this.addToOfflineQueue(offlineAction);

        // Return optimistic Activity
        return {
          ...Activity,
          id: `offline_${offlineAction.id}`,
          userId,
          createdAt: new Date(),
        } as Activity;
      }
    } catch (error) {
      console.error("Failed to create Activity:", error);
      throw new Error("Failed to create Activity");
    }
  }

  /**
   * Get user sessions (cache-first, then network)
   */
  async getUserSessions(
    userId: string,
    limitCount = 50,
    forceRefresh = false
  ): Promise<ActivitySession[]> {
    const cacheKey = `${STORAGE_KEYS.USER_SESSIONS}_${userId}`;

    try {
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedSessions = await storageService.getItem<ActivitySession[]>(
          cacheKey,
          CACHE_DURATION.SESSIONS
        );
        if (cachedSessions) {
          return cachedSessions.slice(0, limitCount);
        }
      }

      // Fetch from network if online
      if (this.isOnline) {
        const sessions = await firestoreService.getUserSessions(
          userId,
          limitCount
        );
        await storageService.setItem(cacheKey, sessions);
        return sessions;
      }

      // Return stale cache if offline
      const staleSessions = await storageService.getItem<ActivitySession[]>(
        cacheKey
      );
      return (staleSessions || []).slice(0, limitCount);
    } catch (error) {
      console.error("Failed to get user sessions:", error);

      // Return stale cache on error
      const staleSessions = await storageService.getItem<ActivitySession[]>(
        cacheKey
      );
      return (staleSessions || []).slice(0, limitCount);
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    session: Omit<ActivitySession, "id" | "userId">
  ): Promise<ActivitySession> {
    try {
      if (this.isOnline) {
        // Create directly in Firestore
        const newSession = await firestoreService.createSession(
          userId,
          session
        );

        // Update cache
        await this.updateSessionsCache(userId);

        return newSession;
      } else {
        // Add to offline queue
        const offlineAction: OfflineAction = {
          id: Date.now().toString(),
          type: "CREATE",
          collection: "sessions",
          documentId: "", // Will be set when syncing
          data: { userId, ...session },
          timestamp: new Date(),
        };

        await this.addToOfflineQueue(offlineAction);

        // Return optimistic session
        return {
          ...session,
          id: `offline_${offlineAction.id}`,
          userId,
        } as ActivitySession;
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      throw new Error("Failed to create session");
    }
  }

  /**
   * Get user stats (cache-first, then network)
   */
  async getUserStats(userId: string, forceRefresh = false): Promise<UserStats> {
    const cacheKey = `${STORAGE_KEYS.USER_STATS}_${userId}`;

    try {
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedStats = await storageService.getItem<UserStats>(
          cacheKey,
          CACHE_DURATION.STATS
        );
        if (cachedStats) {
          return cachedStats;
        }
      }

      // Fetch from network if online
      if (this.isOnline) {
        const stats = await firestoreService.getUserStats(userId);
        await storageService.setItem(cacheKey, stats);
        return stats;
      }

      // Return stale cache if offline
      const staleStats = await storageService.getItem<UserStats>(cacheKey);
      return (
        staleStats || {
          userId,
          totalActivities: 0,
          totalSessions: 0,
          lastActiveAt: new Date(),
          createdAt: new Date(),
        }
      );
    } catch (error) {
      console.error("Failed to get user stats:", error);

      // Return stale cache on error
      const staleStats = await storageService.getItem<UserStats>(cacheKey);
      return (
        staleStats || {
          userId,
          totalActivities: 0,
          totalSessions: 0,
          lastActiveAt: new Date(),
          createdAt: new Date(),
        }
      );
    }
  }

  /**
   * Update Activities cache
   */
  private async updateActivitiesCache(userId: string): Promise<void> {
    try {
      const Activities = await firestoreService.getUserActivities(userId);
      const cacheKey = `${STORAGE_KEYS.USER_ACTIVITIES}_${userId}`;
      await storageService.setItem(cacheKey, Activities);
    } catch (error) {
      console.error("Failed to update Activities cache:", error);
    }
  }

  /**
   * Update sessions cache
   */
  private async updateSessionsCache(userId: string): Promise<void> {
    try {
      const sessions = await firestoreService.getUserSessions(userId);
      const cacheKey = `${STORAGE_KEYS.USER_SESSIONS}_${userId}`;
      await storageService.setItem(cacheKey, sessions);
    } catch (error) {
      console.error("Failed to update sessions cache:", error);
    }
  }

  /**
   * Add action to offline queue
   */
  private async addToOfflineQueue(action: OfflineAction): Promise<void> {
    this.offlineQueue.push(action);
    await storageService.setItem(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
  }

  /**
   * Process offline queue when coming back online
   */
  private async processOfflineQueue(): Promise<void> {
    try {
      const savedQueue = await storageService.getItem<OfflineAction[]>(
        STORAGE_KEYS.OFFLINE_QUEUE
      );
      if (savedQueue) {
        this.offlineQueue = savedQueue;
      }

      if (this.offlineQueue.length === 0) return;

      console.log(`Processing ${this.offlineQueue.length} offline actions...`);

      for (const action of this.offlineQueue) {
        try {
          await this.processOfflineAction(action);
        } catch (error) {
          console.error(
            `Failed to process offline action ${action.id}:`,
            error
          );
        }
      }

      // Clear the queue after processing
      this.offlineQueue = [];
      await storageService.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        this.offlineQueue
      );
    } catch (error) {
      console.error("Failed to process offline queue:", error);
    }
  }

  /**
   * Process a single offline action
   */
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case "CREATE":
        if (action.collection === "Activities") {
          await firestoreService.createActivity(
            action.data.userId,
            action.data
          );
        } else if (action.collection === "sessions") {
          await firestoreService.createSession(action.data.userId, action.data);
        }
        break;
      case "UPDATE":
        // Handle updates if needed
        break;
      case "DELETE":
        // Handle deletes if needed
        break;
    }
  }

  /**
   * Clear all cached data for a user
   */
  async clearUserData(userId: string): Promise<void> {
    const keys = [
      `${STORAGE_KEYS.USER_ACTIVITIES}_${userId}`,
      `${STORAGE_KEYS.USER_SESSIONS}_${userId}`,
      `${STORAGE_KEYS.USER_STATS}_${userId}`,
    ];

    await Promise.all(keys.map((key) => storageService.removeItem(key)));
  }
}

// Export singleton instance
export const dataService = new DataService();
