import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
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
import { useData } from "../hooks/useData";

const { width } = Dimensions.get("window");

interface ExerciseStats {
  average: number;
  best: number;
  totalSessions: number;
  metric: string;
  // For dynamometer: separate left/right stats
  leftHand?: {
    average: number;
    best: number;
  };
  rightHand?: {
    average: number;
    best: number;
  };
}

interface ChallengeStats {
  best: number;
  totalAttempts: number;
  metric: string;
}

export default function DashboardScreen() {
  const {
    sessions,
    activities,
    isLoading,
    loadSessions,
    loadActivities,
    refreshAll,
  } = useData();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSessions();
      loadActivities();
    }, [loadSessions, loadActivities])
  );

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

  const exerciseStats = useMemo(() => {
    const stats: Record<string, ExerciseStats> = {
      hang: { average: 0, best: 0, totalSessions: 0, metric: "seconds" },
      "farmer-walk": {
        average: 0,
        best: 0,
        totalSessions: 0,
        metric: "meters",
      },
      dynamometer: { average: 0, best: 0, totalSessions: 0, metric: "kg" },
    };

    // Calculate stats for REGULAR exercise types only (exclude attia-challenge)
    Object.keys(stats).forEach((exerciseType) => {
      const exerciseSessions = sessions.filter((session) => {
        const activity = activities.find((a) => a.id === session.challengeId);
        return activity?.type === exerciseType; // Only regular activities, not attia-challenge
      });

      if (exerciseSessions.length === 0) return;

      const values: number[] = [];
      let bestValue = 0;

      if (exerciseType === "dynamometer") {
        // For dynamometer: get left/right values from activity, not session
        const leftValues: number[] = [];
        const rightValues: number[] = [];
        let leftBest = 0;
        let rightBest = 0;

        exerciseSessions.forEach((session) => {
          const activity = activities.find((a) => a.id === session.challengeId);
          if (activity && activity.type === "dynamometer") {
            const dynamometerActivity = activity as any; // Cast to access leftHandValue/rightHandValue
            if (dynamometerActivity.leftHandValue) {
              leftValues.push(dynamometerActivity.leftHandValue);
              leftBest = Math.max(leftBest, dynamometerActivity.leftHandValue);
            }
            if (dynamometerActivity.rightHandValue) {
              rightValues.push(dynamometerActivity.rightHandValue);
              rightBest = Math.max(
                rightBest,
                dynamometerActivity.rightHandValue
              );
            }
          }
        });

        // Calculate averages
        const leftAverage =
          leftValues.length > 0
            ? leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length
            : 0;
        const rightAverage =
          rightValues.length > 0
            ? rightValues.reduce((sum, val) => sum + val, 0) /
              rightValues.length
            : 0;

        // Store left/right stats
        stats[exerciseType] = {
          average: 0, // Not used for dynamometer
          best: 0, // Not used for dynamometer
          totalSessions: exerciseSessions.length,
          metric: stats[exerciseType].metric,
          leftHand: {
            average: Math.round(leftAverage * 10) / 10,
            best: Math.round(leftBest * 10) / 10,
          },
          rightHand: {
            average: Math.round(rightAverage * 10) / 10,
            best: Math.round(rightBest * 10) / 10,
          },
        };
      } else {
        // For hang and farmer-walk: sum of all split values (actual exercise time)
        exerciseSessions.forEach((session) => {
          const sessionValue = session.splits.reduce((sum, split) => {
            if (split.isRest) return sum;
            return sum + split.value;
          }, 0);

          values.push(sessionValue);
          bestValue = Math.max(bestValue, sessionValue);
        });
      }

      if (values.length > 0) {
        const average =
          values.reduce((sum, val) => sum + val, 0) / values.length;
        stats[exerciseType] = {
          average: Math.round(average * 10) / 10,
          best: Math.round(bestValue * 10) / 10,
          totalSessions: exerciseSessions.length,
          metric: stats[exerciseType].metric,
        };
      }
    });

    return stats;
  }, [sessions, activities]);

  const challengeStats = useMemo(() => {
    const stats: Record<string, ChallengeStats> = {
      hang: { best: 0, totalAttempts: 0, metric: "seconds" },
      "farmer-walk": { best: 0, totalAttempts: 0, metric: "seconds" },
    };

    // Calculate challenge stats ONLY for Attia Challenge activities
    Object.keys(stats).forEach((challengeType) => {
      const challengeSessions = sessions.filter((session) => {
        const activity = activities.find((a) => a.id === session.challengeId);
        return (
          activity?.type === "attia-challenge" &&
          activity.attiaType === challengeType
        ); // Only Attia challenges of this type
      });

      let bestTime = 0;
      let totalAttempts = challengeSessions.length;

      challengeSessions.forEach((session) => {
        // Use totalElapsedTime (like AttiaChart does)
        const sessionTime = session.totalElapsedTime || 0;
        bestTime = Math.max(bestTime, sessionTime);
      });

      stats[challengeType] = {
        best: Math.round(bestTime * 10) / 10,
        totalAttempts,
        metric: "seconds", // Both challenges are time-based
      };
    });

    return stats;
  }, [sessions, activities]);

  const formatValue = (value: number, metric: string): string => {
    if (metric === "seconds") {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
    if (metric === "meters") {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
    }
    if (metric === "kg") {
      return `${value}kg`;
    }
    return `${value}`;
  };

  const getAttiaChallengeTarget = (challengeType: string): number => {
    if (challengeType === "hang") return 120; // 2 minutes
    if (challengeType === "farmer-walk") return 60; // 1 minute
    return 0;
  };

  const getProgressPercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const CircularProgress = ({
    percentage,
    size = 80,
    strokeWidth = 6,
    color = Colors.hangColor,
  }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    return (
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <View
          style={[
            styles.circularProgressBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: Colors.border + "30",
            },
          ]}
        />
        <View
          style={[
            styles.circularProgressFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: "transparent",
              borderTopColor: percentage > 0 ? color : "transparent",
              borderRightColor: percentage > 25 ? color : "transparent",
              borderBottomColor: percentage > 50 ? color : "transparent",
              borderLeftColor: percentage > 75 ? color : "transparent",
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
        <Text style={[styles.circularProgressText, { fontSize: size * 0.2 }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DASHBOARD</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
      </View>

      {/* Attia Challenge Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenges Progress</Text>
        <View style={styles.challengeOverview}>
          <View style={styles.challengeItem}>
            <CircularProgress
              percentage={getProgressPercentage(
                challengeStats.hang.best,
                getAttiaChallengeTarget("hang")
              )}
              color={Colors.hangColor}
            />
            <Text style={styles.challengeLabel}>ATTIA HANG</Text>
            <Text style={styles.challengePercentage}>
              {Math.round(
                getProgressPercentage(
                  challengeStats.hang.best,
                  getAttiaChallengeTarget("hang")
                )
              )}
              %
            </Text>
          </View>
          <View style={styles.challengeItem}>
            <CircularProgress
              percentage={getProgressPercentage(
                challengeStats["farmer-walk"].best,
                getAttiaChallengeTarget("farmer-walk")
              )}
              color={Colors.farmerWalksColor}
            />
            <Text style={styles.challengeLabel}>ATTIA FARMER WALK</Text>
            <Text style={styles.challengePercentage}>
              {Math.round(
                getProgressPercentage(
                  challengeStats["farmer-walk"].best,
                  getAttiaChallengeTarget("farmer-walk")
                )
              )}
              %
            </Text>
          </View>
        </View>
      </View>

      {/* Training Exercise Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Performance</Text>

        {/* Hang Stats */}
        <View
          style={[styles.exerciseCard, { borderLeftColor: Colors.hangColor }]}
        >
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>HANGING</Text>
          </View>
          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BEST</Text>
              <Text style={styles.statValue}>
                {formatValue(exerciseStats.hang.best, "seconds")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AVERAGE</Text>
              <Text style={styles.statValue}>
                {formatValue(exerciseStats.hang.average, "seconds")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SESSIONS</Text>
              <Text style={styles.statValue}>
                {exerciseStats.hang.totalSessions}
              </Text>
            </View>
          </View>
        </View>

        {/* Farmer Walk Stats */}
        <View
          style={[
            styles.exerciseCard,
            { borderLeftColor: Colors.farmerWalksColor },
          ]}
        >
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>FARMER WALK</Text>
          </View>
          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BEST</Text>
              <Text style={styles.statValue}>
                {formatValue(exerciseStats["farmer-walk"].best, "meters")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AVERAGE</Text>
              <Text style={styles.statValue}>
                {formatValue(exerciseStats["farmer-walk"].average, "meters")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SESSIONS</Text>
              <Text style={styles.statValue}>
                {exerciseStats["farmer-walk"].totalSessions}
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamometer Stats */}
        <View
          style={[
            styles.exerciseCard,
            { borderLeftColor: Colors.dynamometerColor },
          ]}
        >
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>DYNAMOMETER</Text>
          </View>
          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>LEFT BEST</Text>
              <Text style={styles.statValue}>
                {exerciseStats.dynamometer.leftHand
                  ? formatValue(exerciseStats.dynamometer.leftHand.best, "kg")
                  : "0kg"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>RIGHT BEST</Text>
              <Text style={styles.statValue}>
                {exerciseStats.dynamometer.rightHand
                  ? formatValue(exerciseStats.dynamometer.rightHand.best, "kg")
                  : "0kg"}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SESSIONS</Text>
              <Text style={styles.statValue}>
                {exerciseStats.dynamometer.totalSessions}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Add Workout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.addWorkoutButton}
          onPress={() => {
            // Navigate to Workouts tab and then to Activities screen
            (navigation as any).navigate("Workouts", { screen: "Activities" });
          }}
        >
          <Ionicons name="add" size={32} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
    marginTop: 16,
    textAlign: "center",
    textTransform: "uppercase",
  },
  challengeOverview: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.darkGray,
    borderRadius: 16,
    padding: 20,
  },
  challengeItem: {
    alignItems: "center",
  },
  circularProgress: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  circularProgressBackground: {
    position: "absolute",
  },
  circularProgressFill: {
    position: "absolute",
  },
  circularProgressText: {
    color: Colors.text,
    fontWeight: "bold",
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  challengePercentage: {
    fontSize: 14,
    color: Colors.lightGray,
  },
  exerciseCard: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  exerciseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.lightGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  addWorkoutButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.hangColor,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignSelf: "center",
  },
});
