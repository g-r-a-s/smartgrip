import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { AuthService, User } from "../types/auth";

/**
 * Firebase authentication service
 * Handles anonymous authentication and user management
 */
class FirebaseAuthService implements AuthService {
  /**
   * Convert Firebase user to our User domain model
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      isAnonymous: firebaseUser.isAnonymous,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      lastActiveAt: new Date(
        firebaseUser.metadata.lastSignInTime || Date.now()
      ),
    };
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<User> {
    try {
      const result = await firebaseSignInAnonymously(auth);
      return this.mapFirebaseUser(result.user);
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
      throw new Error("Failed to sign in anonymously");
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw new Error("Failed to sign out");
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }
}

// Export singleton instance
export const authService = new FirebaseAuthService();
