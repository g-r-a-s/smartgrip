/**
 * RevenueCat Configuration
 *
 * Add your RevenueCat API key to a .env file:
 * EXPO_PUBLIC_REVENUECAT_API_KEY=your_api_key_here
 */

export const REVENUECAT_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";

// Track if we've already initialized
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup (e.g., in App.tsx useEffect)
 */
export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (!REVENUECAT_API_KEY) {
    console.warn(
      "RevenueCat API key not found. Please add EXPO_PUBLIC_REVENUECAT_API_KEY to your .env file"
    );
    return;
  }

  try {
    const Purchases = require("react-native-purchases").default;

    if (Purchases) {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      console.log(
        "RevenueCat configured with API key:",
        REVENUECAT_API_KEY ? "✅ Present" : "❌ Missing"
      );

      // Wait a bit for StoreKit Configuration file to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch initial customer info and offerings with proper error handling
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info:", customerInfo);
      } catch (error) {
        console.error("Error fetching customer info:", error);
      }

      try {
        const offerings = await Purchases.getOfferings();
        console.log(
          "📦 Full Offerings Response:",
          JSON.stringify(offerings, null, 2)
        );

        if (!offerings) {
          console.error(
            "❌ Offerings is null - RevenueCat couldn't fetch any offerings"
          );
        } else {
          console.log("✅ Offerings object exists");
          console.log("📋 Current offering:", offerings.currentOffering);
          console.log(
            "📚 All offerings keys:",
            Object.keys(offerings.all || {})
          );

          // Check if we have offerings but no current one
          if (
            !offerings.currentOffering &&
            offerings.all &&
            Object.keys(offerings.all).length > 0
          ) {
            console.warn(
              "⚠️ Offerings exist in RevenueCat, but none is set as 'current offering'.\n" +
                "   Go to RevenueCat dashboard → Offerings → 'default' → Make sure it's marked as current (should have checkmark ✓)"
            );
          }

          // Check if we have no offerings at all
          if (
            !offerings.currentOffering &&
            (!offerings.all || Object.keys(offerings.all).length === 0)
          ) {
            console.error(
              "❌ No offerings found. This usually means:\n" +
                "   1. StoreKit Configuration file is NOT loading (most likely)\n" +
                "   2. Products in StoreKit file don't match RevenueCat product IDs\n" +
                "   \n" +
                "   💡 SOLUTION: Run the app from Xcode to ensure StoreKit file loads:\n" +
                "   1. Open ios/smartgrip.xcworkspace in Xcode\n" +
                "   2. Press ⌘R to run (this ensures StoreKit config loads)\n" +
                "   \n" +
                "   Expected products in StoreKit: com.georgesryan.smartgrip.app.pro.weekly, com.georgesryan.smartgrip.app.pro.yearly"
            );
          }
        }
      } catch (error: any) {
        console.error("Error fetching offerings:", error);
        if (error.message?.includes("StoreKit Configuration")) {
          console.error(
            "💡 Tip: Run the app from Xcode (not just expo run:ios) to ensure StoreKit Configuration file loads.\n" +
              "Or ensure your Xcode scheme has the StoreKit Configuration file set in Product > Scheme > Edit Scheme > Run > StoreKit Configuration"
          );
        }
      }

      isInitialized = true;
      console.log("RevenueCat initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
  }
}
