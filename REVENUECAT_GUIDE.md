# RevenueCat Integration Guide

## What We've Set Up

1. ✅ Installed `react-native-purchases` package
2. ✅ Created RevenueCat configuration (`src/config/revenuecat.ts`)
3. ✅ Auto-initialize RevenueCat on app startup (in `App.tsx`)
4. ✅ Created paywall helper service (`src/services/paywallService.ts`)

## Next Steps

### 1. Get Your API Key

1. Sign up at https://app.revenuecat.com
2. Create a new project
3. Add your iOS and Android apps
4. Get your API keys from the dashboard

### 2. Add API Key to Your App

Create a `.env` file in the root of your project:

```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your_api_key_here
```

**Important:** `.env` is already in `.gitignore`, so your API key won't be committed to git.

### 3. How to Use the Paywall

#### Example 1: Check subscription status

```typescript
import { hasActiveSubscription } from "./src/services/paywallService";

const isSubscribed = await hasActiveSubscription();
if (!isSubscribed) {
  // Show paywall or lock feature
}
```

#### Example 2: Show paywall manually

```typescript
import { showPaywall } from "./src/services/paywallService";

// User taps "Upgrade" button
await showPaywall();
```

#### Example 3: In a React component

```typescript
import React from "react";
import { showPaywall, hasActiveSubscription } from "../services/paywallService";

function SomeScreen() {
  const handleUpgrade = async () => {
    const isSubscribed = await hasActiveSubscription();
    if (!isSubscribed) {
      await showPaywall();
    }
  };

  return <Button title="Upgrade to Premium" onPress={handleUpgrade} />;
}
```

## Configure Products in RevenueCat

1. Go to RevenueCat Dashboard → Products
2. Create your subscription products:

   - Monthly subscription
   - Yearly subscription
   - (Optional) Lifetime product

3. Configure entitlements (e.g., "premium")
4. Create an offering with these packages

## Testing

- Use RevenueCat's sandbox environment for testing
- Test purchases won't charge real money
- RevenueCat provides test user accounts

## Important Notes

- The API key is client-side by design (not secret)
- RevenueCat enforces security server-side
- Replace 'premium' in the code with your actual entitlement ID from RevenueCat dashboard
- The paywall UI is handled by RevenueCat SDK - no custom UI needed
