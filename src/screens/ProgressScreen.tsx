import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";

export default function ProgressScreen() {
  const { user } = useAuth();
  const { sessions, activities, loadSessions, loadActivities } = useData();

  useEffect(() => {
    if (user) {
      loadSessions();
      loadActivities();
    }
  }, [user, loadSessions, loadActivities]);

  // Filter hang activities and sessions
  const hangActivities = activities.filter(
    (activity) => activity.type === "hang"
  );
  const hangSessions = sessions.filter((session) => {
    const activity = hangActivities.find((a) => a.id === session.challengeId);
    return activity && activity.type === "hang";
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progress</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{hangActivities.length}</Text>
          <Text style={styles.statLabel}>Total Challenges</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{hangSessions.length}</Text>
          <Text style={styles.statLabel}>Completed Sessions</Text>
        </View>
      </View>

      <View style={styles.sessionsContainer}>
        <Text style={styles.sectionTitle}>Recent Hang Sessions</Text>
        {hangSessions.length === 0 ? (
          <Text style={styles.emptyText}>
            No sessions yet. Complete a hang challenge to see your progress!
          </Text>
        ) : (
          hangSessions.slice(0, 5).map((session, index) => {
            const activity = hangActivities.find(
              (a) => a.id === session.challengeId
            );
            return (
              <View key={session.id} style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>
                  {activity?.targetTime
                    ? `${Math.floor(activity.targetTime / 60)}:${(
                        activity.targetTime % 60
                      )
                        .toString()
                        .padStart(2, "0")}`
                    : "Unknown"}{" "}
                  Target
                </Text>
                <Text style={styles.sessionStats}>
                  {session.splits.length} splits •{" "}
                  {Math.floor((session.totalElapsedTime || 0) / 60)}:
                  {(session.totalElapsedTime || 0) % 60 < 10 ? "0" : ""}
                  {(session.totalElapsedTime || 0) % 60} total
                </Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.startTime).toLocaleDateString()}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  sessionsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  sessionCard: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 5,
  },
  sessionStats: {
    fontSize: 14,
    color: "#4ECDC4",
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

