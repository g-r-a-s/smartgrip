import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initializeRevenueCat } from "./src/config/revenuecat";
import { AuthProvider } from "./src/hooks/useAuth";
import { useNetworkStatus } from "./src/hooks/useNetworkStatus";
import AppNavigator from "./src/navigation/AppNavigator";

function AppContent() {
  // Initialize network status monitoring
  useNetworkStatus();

  // Initialize RevenueCat on app start
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
