/**
 * Authentication domain types for SmartGrip
 */

export interface User {
  uid: string;
  isAnonymous: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthService {
  signInAnonymously(): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
