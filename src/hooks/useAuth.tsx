import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/authService";
import { AuthContextType, AuthState, User } from "../types/auth";

/**
 * Authentication context for managing auth state across the app
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Wraps the app and provides auth state and methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  /**
   * Set up authentication state listener
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user: User | null) => {
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  /**
   * Sign in anonymously
   */
  const signInAnonymously = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authService.signInAnonymously();
      // Auth state will be updated via the listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }));
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authService.signOut();
      // Auth state will be updated via the listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      }));
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const user = authService.getCurrentUser();
      setAuthState((prev) => ({ ...prev, user }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Refresh failed",
      }));
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    signInAnonymously,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
