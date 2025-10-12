import { useCallback, useEffect, useState } from "react";
import { dataService } from "../services/dataService";
import { Activity, ActivitySession, UserStats } from "../types/activities";
import { useAuth } from "./useAuth";
import { useNetworkStatus } from "./useNetworkStatus";

/**
 * Hook for managing training data with offline support
 * Combines authentication, network status, and data operations
 */
export function useData() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user's activities
   */
  const loadActivities = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const userActivities = await dataService.getUserActivities(
          user.uid,
          forceRefresh
        );
        setActivities(userActivities);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load activities"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Load user's sessions
   */
  const loadSessions = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const userSessions = await dataService.getUserSessions(
          user.uid,
          50,
          forceRefresh
        );
        setSessions(userSessions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sessions"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Load user's stats
   */
  const loadUserStats = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const stats = await dataService.getUserStats(user.uid, forceRefresh);
        setUserStats(stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user stats"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Create a new activity
   */
  const createActivity = useCallback(
    async (activity: Omit<Activity, "id" | "userId" | "createdAt">) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setError(null);
        const newActivity = await dataService.createActivity(
          user.uid,
          activity
        );

        // Update local state optimistically
        setActivities((prev) => [newActivity, ...prev]);

        // Update stats
        if (userStats) {
          setUserStats((prev) =>
            prev
              ? {
                  ...prev,
                  totalActivities: prev.totalActivities + 1,
                  lastActiveAt: new Date(),
                }
              : null
          );
        }

        return newActivity;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create activity"
        );
        throw err;
      }
    },
    [user, userStats]
  );

  /**
   * Create a new session
   */
  const createSession = useCallback(
    async (session: Omit<ActivitySession, "id" | "userId">) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setError(null);
        const newSession = await dataService.createSession(user.uid, session);

        // Update local state optimistically
        setSessions((prev) => [newSession, ...prev]);

        // Update stats
        if (userStats) {
          setUserStats((prev) =>
            prev
              ? {
                  ...prev,
                  totalSessions: prev.totalSessions + 1,
                  lastActiveAt: new Date(),
                }
              : null
          );
        }

        return newSession;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create session"
        );
        throw err;
      }
    },
    [user, userStats]
  );

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    if (!user) return;

    await Promise.all([
      loadActivities(true),
      loadSessions(true),
      loadUserStats(true),
    ]);
  }, [user, loadActivities, loadSessions, loadUserStats]);

  /**
   * Load initial data when user changes
   */
  useEffect(() => {
    if (user) {
      loadActivities();
      loadSessions();
      loadUserStats();
    } else {
      setActivities([]);
      setSessions([]);
      setUserStats(null);
    }
  }, [user, loadActivities, loadSessions, loadUserStats]);

  return {
    // Data
    activities,
    sessions,
    userStats,

    // State
    isLoading,
    error,
    isOnline,

    // Actions
    createActivity,
    createSession,
    loadActivities,
    loadSessions,
    loadUserStats,
    refreshAll,

    // Utilities
    clearError: () => setError(null),
  };
}
