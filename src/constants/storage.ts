/**
 * Storage constants and configuration
 */

export const STORAGE_KEYS = {
  USER_ACTIVITIES: "USER_ACTIVITIES",
  USER_SESSIONS: "user_sessions",
  USER_STATS: "user_stats",
  USER_PROFILE: "user_profile",
  OFFLINE_QUEUE: "offline_queue",
  LAST_SYNC: "last_sync",
  USER_PREFERENCES: "user_preferences",
} as const;

export const CACHE_DURATION = {
  ACTIVITIES: 24 * 60 * 60 * 1000, // 24 hours
  SESSIONS: 7 * 24 * 60 * 60 * 1000, // 7 days
  STATS: 60 * 60 * 1000, // 1 hour
  PROFILE: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const SYNC_CONFIG = {
  BATCH_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
