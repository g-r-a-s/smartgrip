import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";

/**
 * Local storage service using AsyncStorage
 * Handles caching and offline data persistence
 */
class StorageService {
  /**
   * Store data with timestamp
   */
  async setItem<T>(key: string, data: T): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: new Date(),
        version: "1.0",
      };
      const jsonString = JSON.stringify(cacheEntry);
      await AsyncStorage.setItem(key, jsonString);
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      throw new Error(`Storage failed for ${key}`);
    }
  }

  /**
   * Retrieve data with timestamp validation
   */
  async getItem<T>(key: string, maxAge?: number): Promise<T | null> {
    try {
      const jsonString = await AsyncStorage.getItem(key);
      if (!jsonString) return null;

      const cacheEntry = JSON.parse(jsonString);

      // Check if data is expired
      if (maxAge) {
        const age = Date.now() - new Date(cacheEntry.timestamp).getTime();
        if (age > maxAge) {
          // Data expired, remove it
          await this.removeItem(key);
          return null;
        }
      }

      return cacheEntry.data;
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
    }
  }

  /**
   * Clear all app data
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS) as string[];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Failed to clear all storage:", error);
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return (await AsyncStorage.getAllKeys()) as string[];
    } catch (error) {
      console.error("Failed to get all keys:", error);
      return [];
    }
  }

  /**
   * Store multiple items at once
   */
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error("Failed to multi-set data:", error);
      throw new Error("Multi-set failed");
    }
  }

  /**
   * Get multiple items at once
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return (await AsyncStorage.multiGet(keys)) as [string, string | null][];
    } catch (error) {
      console.error("Failed to multi-get data:", error);
      return keys.map((key) => [key, null]);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
