import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useRef, useState } from "react";
import { STORAGE_KEYS } from "../constants/storage";
import { hasActiveSubscription, showPaywall } from "../services/paywallService";

/**
 * Hook to manage paywall display logic
 * - Shows paywall after onboarding
 * - Shows paywall on app start if user is not subscribed
 */
export function usePaywall() {
  const [isChecking, setIsChecking] = useState(true);
  const [showPaywallNow, setShowPaywallNow] = useState(false);
  const hasShownPaywallThisSession = useRef(false); // Track if paywall shown in current session

  /**
   * Check if paywall was already shown after onboarding
   */
  const checkPaywallShown = useCallback(async () => {
    try {
      const shown = await AsyncStorage.getItem(STORAGE_KEYS.PAYWALL_SHOWN);
      return shown === "true";
    } catch (error) {
      console.error("Error checking paywall status:", error);
      return false;
    }
  }, []);

  /**
   * Mark paywall as shown
   */
  const markPaywallShown = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYWALL_SHOWN, "true");
    } catch (error) {
      console.error("Error marking paywall as shown:", error);
    }
  }, []);

  /**
   * Check subscription and show paywall if needed
   * Shows paywall on app start if user doesn't have active subscription
   */
  const checkAndShowPaywall = useCallback(async () => {
    try {
      // Prevent showing paywall multiple times in quick succession (debounce)
      if (hasShownPaywallThisSession.current) {
        console.log("Paywall check already in progress, skipping");
        return false;
      }

      setIsChecking(true);

      // Always check subscription status
      const hasSubscription = await hasActiveSubscription();

      // Show paywall if user is not subscribed (hard paywall - blocks access)
      if (!hasSubscription) {
        console.log("User not subscribed, showing paywall (hard paywall mode)");
        hasShownPaywallThisSession.current = true; // Set flag before showing

        // Show paywall - it will keep showing until user subscribes
        const subscribed = await showPaywall();

        if (subscribed) {
          console.log("✅ User subscribed, granting access");
          hasShownPaywallThisSession.current = false; // Reset flag
          return true;
        } else {
          // If paywall was cancelled/closed
          console.log("Paywall dismissed");
          hasShownPaywallThisSession.current = false; // Reset flag
          return false;
        }
      } else {
        console.log("User has active subscription, granting access");
        hasShownPaywallThisSession.current = false; // Reset flag
        return true;
      }
    } catch (error) {
      console.error("Error checking paywall:", error);
      hasShownPaywallThisSession.current = false; // Reset on error
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Manually trigger paywall (for testing or manual triggers)
   */
  const triggerPaywall = useCallback(async () => {
    try {
      await showPaywall();
    } catch (error) {
      console.error("Error showing paywall:", error);
    }
  }, []);

  return {
    isChecking,
    checkAndShowPaywall,
    triggerPaywall,
  };
}
