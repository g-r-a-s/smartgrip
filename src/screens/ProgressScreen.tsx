import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { ActivityType } from "../types/activities";

type FilterType = ActivityType;

const { width: screenWidth } = Dimensions.get("window");
const CHART_HEIGHT = screenWidth - 40; // Now width becomes height
const CHART_WIDTH = 300; // Fixed width for horizontal bars

export default function ProgressScreen() {
  const { user } = useAuth();
  const { sessions, activities, loadSessions, loadActivities, refreshAll } =
    useData();
  const [filter, setFilter] = useState<FilterType>("hang");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSessions();
      loadActivities();
    }
  }, [user, loadSessions, loadActivities]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "hang":
        return Colors.hangColor;
      case "farmer-walk":
        return Colors.farmerWalksColor;
      case "dynamometer":
        return Colors.dynamometerColor;
      default:
        return Colors.white;
    }
  };

  const getActivityName = (type: ActivityType) => {
    switch (type) {
      case "hang":
        return "Hang";
      case "farmer-walk":
        return "Farmer Walks";
      case "dynamometer":
        return "Dynamometer";
      default:
        return type;
    }
  };

  // Filter sessions by activity type
  const filteredSessions = sessions.filter((session) => {
    const activity = activities.find((a) => a.id === session.challengeId);
    return activity?.type === filter;
  });

  // Group sessions by date for chart
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    filteredSessions.forEach((session) => {
      const date = new Date(session.startTime).toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!grouped[date]) {
        grouped[date] = [];
      }

      // Find the activity to get target values
      const activity = activities.find((a) => a.id === session.challengeId);

      // Calculate total value based on activity type
      let totalValue = 0;
      let targetValue = 0;

      if (activity?.type === "hang") {
        // For hang: sum of split durations (time)
        totalValue = session.splits.reduce(
          (sum: number, split: any) => sum + (split.duration || 0),
          0
        );
        targetValue = activity.targetTime;
      } else if (activity?.type === "farmer-walk") {
        // For farmer walk: sum of split values
        console.log("session.splits", session.splits);
        totalValue = session.splits.reduce(
          (sum: number, split: any) => sum + (split.value || 0),
          0
        );
        targetValue = activity.distance;
      }

      grouped[date].push({
        session,
        splits: session.splits,
        targetValue,
        totalValue,
        activityType: activity?.type, // Pass the activity type
      });
    });

    // Sort by date and get last 14 days (more data with horizontal layout)
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

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.emptyChartText}>
            No {getActivityName(filter as ActivityType)} sessions yet.
            {"\n"}Complete some challenges to see your progress!
          </Text>
        </View>
      );
    }

    // Find max value from actual data for X-axis scaling
    const maxValue = Math.max(
      ...chartData.flatMap((d) => d.sessions.map((s) => s.totalValue || 0))
    );

    // Debug: log the max value
    console.log("Max value:", maxValue);
    console.log("CHART_HEIGHT:", CHART_HEIGHT);

    // Use the longest value as our X-axis maximum
    const yAxisMax = maxValue;

    // Calculate dynamic chart width based on maximum value
    // Scale with data but respect screen boundaries
    const minChartWidth = 200; // Minimum readable width
    const maxChartWidth = screenWidth - 80; // Maximum width that fits screen
    const pixelsPerUnit = 2; // Scale factor for readability
    const idealWidth = maxValue * pixelsPerUnit;
    const chartWidth = Math.max(
      minChartWidth,
      Math.min(maxChartWidth, idealWidth)
    );

    const barWidth = (CHART_WIDTH - 60) / chartData.length;

    // Create X-axis time labels (now horizontal)
    const timeLabels = [
      0,
      Math.round(yAxisMax * 0.25),
      Math.round(yAxisMax * 0.5),
      Math.round(yAxisMax * 0.75),
      yAxisMax, // This should be the actual max (e.g., 135 seconds = 2:15)
    ];

    // Debug: log the time labels
    console.log("Time labels:", timeLabels);
    console.log(
      "Formatted labels:",
      timeLabels.map((t) => formatTime(t))
    );
    console.log("Chart width:", chartWidth);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {/* Chart area - now scrollable vertically */}
          <ScrollView
            style={styles.chartScrollArea}
            showsVerticalScrollIndicator={false}
          >
            {chartData.map((data, index) => {
              return (
                <View key={index} style={styles.dayRow}>
                  {/* Date label on the left */}
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>

                  {/* Sessions for this day */}
                  <View style={styles.sessionsContainer}>
                    {data.sessions.map((session, sessionIndex) => {
                      // Use pre-calculated total value
                      const totalValue = session.totalValue || 0;

                      // Actual value bar width (scaled to max value)
                      const availableWidth = chartWidth - 60; // Same as label positioning
                      const barWidth = (totalValue / yAxisMax) * availableWidth;

                      return (
                        <View key={sessionIndex} style={styles.sessionRow}>
                          <View style={styles.bar}>
                            {/* Single solid bar representing total value */}
                            <View
                              style={[
                                styles.splitSegment,
                                {
                                  width: barWidth,
                                  left: 0,
                                  backgroundColor: getActivityColor(
                                    filter as ActivityType
                                  ),
                                },
                              ]}
                            >
                              <Text style={styles.splitDurationText}>
                                {session.activityType === "farmer-walk"
                                  ? formatDistance(totalValue)
                                  : formatTime(totalValue)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.hangColor}
          colors={[Colors.hangColor]}
        />
      }
    >
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>Your progress for the last month</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "hang" && { backgroundColor: Colors.hangColor },
          ]}
          onPress={() => setFilter("hang")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "hang" && styles.filterTextActive,
            ]}
          >
            Hang
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "farmer-walk" && {
              backgroundColor: Colors.farmerWalksColor,
            },
          ]}
          onPress={() => setFilter("farmer-walk")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "farmer-walk" && styles.filterTextActive,
            ]}
          >
            Farmer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "dynamometer" && {
              backgroundColor: Colors.dynamometerColor,
            },
          ]}
          onPress={() => setFilter("dynamometer")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "dynamometer" && styles.filterTextActive,
            ]}
          >
            Dyna
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      {renderChart()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.darkGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.white,
  },
  filterText: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.black,
  },
  chartContainer: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    height: 350,
  },
  chart: {
    flex: 1,
    flexDirection: "column",
  },
  xAxis: {
    height: 25,
    position: "relative",
    marginBottom: 15,
    marginLeft: 50, // Align with date labels
  },
  xAxisLabel: {
    color: Colors.white,
    fontSize: 10,
    textAlign: "center",
  },
  chartScrollArea: {
    flex: 1,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    minHeight: 25,
  },
  dateContainer: {
    width: 50,
    alignItems: "center",
  },
  dateLabel: {
    color: Colors.white,
    fontSize: 10,
    textAlign: "center",
  },
  sessionsContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  sessionRow: {
    height: 18,
    marginBottom: 2,
  },
  bar: {
    height: 18,
    width: CHART_HEIGHT - 70, // Account for padding and margins
    backgroundColor: Colors.black,
    borderRadius: 2,
    position: "relative",
  },
  splitSegment: {
    position: "absolute",
    height: "100%",
    borderRadius: 2,
    minWidth: 10,
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
  targetLine: {
    position: "absolute",
    height: "100%",
    width: 2,
    backgroundColor: Colors.white,
    opacity: 0.8,
  },
  chartTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  emptyChartText: {
    color: Colors.gray,
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 40,
  },
});
