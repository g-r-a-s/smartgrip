import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Activity, ActivitySession, Split } from "../../types/activities";

const { width: screenWidth } = Dimensions.get("window");

interface HangChartProps {
  activities: Activity[];
  sessions: ActivitySession[];
}

export default function HangChart({ activities, sessions }: HangChartProps) {
  // Filter sessions for hang activities only
  const hangSessions = sessions.filter((session) => {
    const activity = activities.find((a) => a.id === session.challengeId);
    return activity?.type === "hang";
  });

  if (hangSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hang sessions yet</Text>
        <Text style={styles.emptySubtext}>
          Start hanging to see your progress!
        </Text>
      </View>
    );
  }

  // Group sessions by date for chart
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    hangSessions.forEach((session) => {
      const date = new Date(session.startTime).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }

      const activity = activities.find((a) => a.id === session.challengeId);
      const totalHangingTime = session.splits.reduce(
        (sum: number, split: Split) => sum + (split.value || 0),
        0
      );

      grouped[date].push({
        session,
        splits: session.splits,
        targetTime: activity?.type === "hang" ? activity.targetTime : 0,
        totalHangingTime,
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Find max hanging time for scaling
  const maxHangingTime = Math.max(
    ...chartData.flatMap((d) => d.sessions.map((s) => s.totalHangingTime || 0)),
    60 // Minimum scale of 1 minute
  );

  const yAxisMax = maxHangingTime;
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
                  const { session, totalHangingTime } = sessionData;
                  const availableWidth = chartWidth - 60;
                  const barWidth =
                    (totalHangingTime / yAxisMax) * availableWidth;

                  return (
                    <View key={sessionIndex} style={styles.sessionRow}>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.splitSegment,
                            {
                              width: barWidth,
                              left: 0,
                              backgroundColor: Colors.hangColor,
                            },
                          ]}
                        >
                          <Text style={styles.splitDurationText}>
                            {formatTime(totalHangingTime)}
                          </Text>
                        </View>
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
    marginBottom: 2,
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
