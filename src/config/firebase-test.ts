import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");

    // Test anonymous authentication
    const userCredential = await signInAnonymously(auth);
    console.log("✅ Anonymous auth successful:", userCredential.user.uid);

    // Test Firestore write
    const testDoc = doc(db, "test", "connection");
    await setDoc(testDoc, {
      timestamp: new Date(),
      message: "Firebase connection test successful",
    });
    console.log("✅ Firestore write successful");

    return { success: true, userId: userCredential.user.uid };
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return { success: false, error };
  }
};
