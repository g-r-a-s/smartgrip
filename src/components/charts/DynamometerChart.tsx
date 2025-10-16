import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Activity, ActivitySession, Split } from "../../types/activities";

const { width: screenWidth } = Dimensions.get("window");

interface DynamometerChartProps {
  activities: Activity[];
  sessions: ActivitySession[];
}

export default function DynamometerChart({
  activities,
  sessions,
}: DynamometerChartProps) {
  // Filter sessions for dynamometer activities only
  const dynamometerSessions = sessions.filter((session) => {
    const activity = activities.find((a) => a.id === session.challengeId);
    return activity?.type === "dynamometer";
  });

  if (dynamometerSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No dynamometer sessions yet</Text>
        <Text style={styles.emptySubtext}>
          Test your grip strength to see your progress!
        </Text>
      </View>
    );
  }

  // Group sessions by date for chart
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    dynamometerSessions.forEach((session) => {
      const date = new Date(session.startTime).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }

      const activity = activities.find((a) => a.id === session.challengeId);

      grouped[date].push({
        session,
        activity,
        splits: session.splits,
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

  const formatWeight = (kg: number) => {
    return `${kg.toFixed(1)} kg`;
  };

  // Find max grip strength for scaling
  const maxGripStrength = Math.max(
    ...chartData.flatMap((d) =>
      d.sessions.flatMap((s) =>
        s.splits.map((split: Split) => split.value || 0)
      )
    ),
    50 // Minimum scale of 50kg
  );

  const yAxisMax = maxGripStrength;
  const chartWidth = screenWidth - 80;

  return (
    <View style={styles.container}>
      {/* Color Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: Colors.dynamometerLeftColor },
            ]}
          />
          <Text style={styles.legendText}>Left Hand</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: Colors.dynamometerColor },
            ]}
          />
          <Text style={styles.legendText}>Right Hand</Text>
        </View>
      </View>

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
                  const { session, splits } = sessionData;

                  return (
                    <View key={sessionIndex} style={styles.sessionRow}>
                      <View style={styles.barsContainer}>
                        {splits.map((split: Split, splitIndex: number) => {
                          const barWidth =
                            ((split.value || 0) / yAxisMax) * (chartWidth - 60);
                          const isLeft = split.id.includes("left");

                          return (
                            <View key={splitIndex} style={styles.singleBar}>
                              <View
                                style={[
                                  styles.splitSegment,
                                  {
                                    width: barWidth,
                                    backgroundColor: isLeft
                                      ? Colors.dynamometerLeftColor
                                      : Colors.dynamometerColor,
                                    height: 15,
                                  },
                                ]}
                              >
                                <Text style={styles.splitDurationText}>
                                  {formatWeight(split.value || 0)}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
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
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "500",
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
  barsContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 2,
  },
  singleBar: {
    width: "100%",
    height: 15,
    justifyContent: "center",
  },
  splitSegment: {
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 30,
    height: 15,
  },
  splitDurationText: {
    color: Colors.white,
    fontSize: 8,
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
