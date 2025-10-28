/**
 * Paywall Service
 * Simple helper to show RevenueCat paywall
 */

let Purchases: any;

async function getPurchases() {
  if (!Purchases) {
    try {
      Purchases = require("react-native-purchases").default;
    } catch (error) {
      console.error("Failed to load react-native-purchases:", error);
    }
  }
  return Purchases;
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const PurchasesSDK = await getPurchases();

    if (!PurchasesSDK) {
      console.log("❌ RevenueCat SDK not available for subscription check");
      return false;
    }

    const customerInfo = await PurchasesSDK.getCustomerInfo();

    // Log all entitlements for debugging
    console.log("📋 Checking subscription status...");
    console.log(
      "Active entitlements:",
      Object.keys(customerInfo.entitlements.active || {})
    );
    console.log(
      "All entitlements:",
      Object.keys(customerInfo.entitlements.all || {})
    );

    // Check if user has any active entitlement
    const hasActiveEntitlement =
      Object.keys(customerInfo.entitlements.active || {}).length > 0;

    // Also check for 'premium' specifically (your entitlement ID)
    const hasPremium =
      customerInfo.entitlements.active["premium"] !== undefined;

    console.log(
      `Subscription check result: hasActiveEntitlement=${hasActiveEntitlement}, hasPremium=${hasPremium}`
    );

    // Return true if there's any active entitlement OR premium
    return hasActiveEntitlement || hasPremium;
  } catch (error) {
    console.error("❌ Error checking subscription:", error);
    return false;
  }
}

/**
 * Get available packages from RevenueCat offerings
 */
export async function getPackages(): Promise<any[] | null> {
  try {
    const PurchasesSDK = await getPurchases();

    if (!PurchasesSDK) {
      console.error("RevenueCat SDK not available");
      return null;
    }

    const offerings = await PurchasesSDK.getOfferings();

    // Try to get current offering, or fallback to "default" offering
    let offering = offerings.currentOffering;

    if (!offering && offerings.all) {
      offering = offerings.all["default"];
      console.log("Using 'default' offering since no current offering is set");
    }

    if (offering && offering.availablePackages.length > 0) {
      return offering.availablePackages;
    } else {
      console.error(
        "No offering available. Check RevenueCat dashboard configuration."
      );
      console.log("Available offerings:", Object.keys(offerings.all || {}));
      return null;
    }
  } catch (error) {
    console.error("Error getting packages:", error);
    return null;
  }
}

/**
 * Show the RevenueCat paywall using RevenueCat's native paywall UI
 * This will display both packages (Weekly and Annual) from your offering
 * Returns true if user subscribed/restored, false otherwise
 */
export async function showPaywall(): Promise<boolean> {
  try {
    const PurchasesSDK = await getPurchases();

    if (!PurchasesSDK) {
      console.error("RevenueCat SDK not available");
      return false;
    }

    const offerings = await PurchasesSDK.getOfferings();

    // Try to get current offering, or fallback to "default" offering
    let offering = offerings.currentOffering;

    if (!offering && offerings.all) {
      offering = offerings.all["default"];
      console.log("Using 'default' offering since no current offering is set");
    }

    if (!offering) {
      console.error(
        "No offering available. Check RevenueCat dashboard configuration."
      );
      console.log("Available offerings:", Object.keys(offerings.all || {}));
      return false;
    }

    // Use RevenueCat UI to present paywall (shows both packages!)
    const RevenueCatUI = require("react-native-purchases-ui").default;
    const { PAYWALL_RESULT } = require("react-native-purchases-ui");

    if (RevenueCatUI) {
      // First, check if user already has subscription before showing paywall
      const alreadySubscribed = await hasActiveSubscription();
      if (alreadySubscribed) {
        console.log(
          "✅ User already has active subscription, skipping paywall"
        );
        return true;
      }

      console.log("Presenting RevenueCat paywall UI...");
      let paywallResult;

      // Keep showing paywall until user subscribes or restores
      do {
        paywallResult = await RevenueCatUI.presentPaywall({
          offering: offering,
        });

        switch (paywallResult) {
          case PAYWALL_RESULT.PURCHASED:
            console.log("✅ User purchased a subscription");
            return true; // Exit loop, user subscribed
          case PAYWALL_RESULT.RESTORED:
            console.log("✅ User restored purchases");
            // Verify subscription after restore
            const hasSub = await hasActiveSubscription();
            if (hasSub) {
              return true; // Exit loop, user has subscription
            }
            break; // Continue showing if restore didn't work
          case PAYWALL_RESULT.CANCELLED:
            console.log("User closed paywall - checking subscription...");
            // Check subscription status before showing again
            const hasSubscription = await hasActiveSubscription();
            if (hasSubscription) {
              console.log("✅ User has subscription, allowing access");
              return true;
            }
            console.log("User closed paywall - showing again (hard paywall)");
            break;
          case PAYWALL_RESULT.NOT_PRESENTED:
            console.log("Paywall was not presented");
            return false;
          case PAYWALL_RESULT.ERROR:
            console.error("Error presenting paywall");
            return false;
        }
      } while (paywallResult === PAYWALL_RESULT.CANCELLED);

      return (
        paywallResult === PAYWALL_RESULT.PURCHASED ||
        paywallResult === PAYWALL_RESULT.RESTORED
      );
    } else {
      // Fallback if UI package not available
      console.warn(
        "RevenueCat UI not available, falling back to first package"
      );
      if (offering.availablePackages.length > 0) {
        await PurchasesSDK.purchasePackage(offering.availablePackages[0]);
        // Fallback doesn't track subscription status, return false
        return false;
      }
    }
    return false;
  } catch (error: any) {
    console.error("Paywall error:", error);
    return false;
  }
}

/**
 * Purchase a specific package
 */
export async function purchasePackage(packageToPurchase: any): Promise<void> {
  try {
    const PurchasesSDK = await getPurchases();
    if (!PurchasesSDK) {
      console.error("RevenueCat SDK not available");
      return;
    }
    await PurchasesSDK.purchasePackage(packageToPurchase);
  } catch (error: any) {
    if (error.userCancelled === false) {
      console.error("Purchase error:", error);
    }
    throw error;
  }
}
