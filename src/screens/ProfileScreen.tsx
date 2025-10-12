import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userId}>User ID: {user.uid}</Text>
          <Text style={styles.userType}>
            {user.isAnonymous ? "Anonymous User" : "Authenticated User"}
          </Text>
          <Text style={styles.userDate}>
            Created: {user.createdAt.toLocaleDateString()}
          </Text>
          <Text style={styles.userDate}>
            Last Active: {user.lastActiveAt.toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About Your Data</Text>
        <Text style={styles.infoText}>
          Your training progress is automatically saved and will persist across
          app sessions. Your data is stored securely and anonymously.
        </Text>
      </View>
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
    marginBottom: 30,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  userId: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  userType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  userDate: {
    fontSize: 14,
    color: "#666",
  },
  infoSection: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 12,
    maxWidth: 300,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
    textAlign: "center",
  },
});
