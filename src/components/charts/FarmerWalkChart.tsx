import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Activity, ActivitySession } from "../../types/activities";

const { width: screenWidth } = Dimensions.get("window");

interface FarmerWalkChartProps {
  activities: Activity[];
  sessions: ActivitySession[];
}

export default function FarmerWalkChart({
  activities,
  sessions,
}: FarmerWalkChartProps) {
  // Filter sessions for farmer-walk activities only
  const farmerWalkSessions = sessions.filter((session) => {
    const activity = activities.find((a) => a.id === session.challengeId);
    return activity?.type === "farmer-walk";
  });

  if (farmerWalkSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No farmer walk sessions yet</Text>
        <Text style={styles.emptySubtext}>
          Start walking to see your progress!
        </Text>
      </View>
    );
  }

  // Group sessions by date for chart
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    farmerWalkSessions.forEach((session) => {
      const date = new Date(session.startTime).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }

      const activity = activities.find((a) => a.id === session.challengeId);
      const totalDistance = session.splits.reduce(
        (sum: number, split) => sum + (split.value || 0),
        0
      );

      grouped[date].push({
        session,
        activity,
        totalDistance,
        activityType: activity?.type,
      });
    });

    const sortedDates = Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-14);

    return sortedDates.map((date) => ({
      date,
      sessions: grouped[date],
    }));
  };

  const chartData = groupSessionsByDate();

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  // Find max distance for scaling
  const maxDistance = Math.max(
    ...chartData.flatMap((d) => d.sessions.map((s) => s.totalDistance || 0)),
    100 // Minimum scale of 100 meters
  );

  const yAxisMax = maxDistance;
  const chartWidth = screenWidth - 80;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map(({ date, sessions }) => (
            <View key={date} style={styles.dateColumn}>
              <Text style={styles.dateLabel}>
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>

              <View style={styles.sessionsContainer}>
                {sessions.map((sessionData, sessionIndex) => {
                  const { session, activity, totalDistance } = sessionData;
                  const availableWidth = chartWidth - 60;
                  const barWidth = (totalDistance / yAxisMax) * availableWidth;

                  return (
                    <View key={sessionIndex} style={styles.sessionRow}>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.splitSegment,
                            {
                              width: barWidth,
                              left: 0,
                              backgroundColor: Colors.farmerWalksColor,
                            },
                          ]}
                        >
                          <Text style={styles.splitDurationText}>
                            {formatDistance(totalDistance)}
                          </Text>
                        </View>
                      </View>

                      {/* Weight Information */}
                      <View style={styles.weightInfo}>
                        <Text style={styles.weightText}>
                          L: {activity?.leftHandWeight || 0}kg
                        </Text>
                        <Text style={styles.weightText}>
                          R: {activity?.rightHandWeight || 0}kg
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
  },
  chart: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "auto",
  },
  dateColumn: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  sessionsContainer: {
    width: "100%",
    alignItems: "center",
    maxWidth: 300,
  },
  sessionRow: {
    width: "100%",
    marginBottom: 4,
  },
  bar: {
    height: 20,
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  splitSegment: {
    position: "absolute",
    height: 20,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  splitDurationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  weightInfo: {
    marginTop: 2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "30%",
  },
  weightText: {
    color: Colors.farmerWalksColor,
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
  },
});
