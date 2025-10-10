import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { testFirebaseConnection } from "./src/config/firebase-test";

export default function App() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      const result = await testFirebaseConnection();
      if (result.success) {
        setFirebaseStatus(`✅ Firebase Connected! User: ${result.userId}`);
      } else {
        setFirebaseStatus(`❌ Firebase Error: ${result.error}`);
      }
    };

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartGrip</Text>
      <Text style={styles.subtitle}>Firebase Status:</Text>
      <Text style={styles.status}>{firebaseStatus}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
});
