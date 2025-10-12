import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { dataService } from "../services/dataService";

/**
 * Hook to monitor network connectivity and manage offline/online state
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Get initial network state
    const getInitialNetworkState = async () => {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected ?? false);
      setIsConnected(state.isConnected);
    };

    getInitialNetworkState();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      setIsConnected(state.isConnected);

      // Update data service with network status
      dataService.setOnlineStatus(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    isConnected,
  };
}
