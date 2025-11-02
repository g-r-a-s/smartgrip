import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SimpleLineChart from "../components/charts/SimpleLineChart";
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

  // Evolution chart filters
  const [selectedActivityType, setSelectedActivityType] =
    useState<string>("hang");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("7d");
  const [selectedChallengeType, setSelectedChallengeType] =
    useState<string>("hang");
  const [showActivityOptions, setShowActivityOptions] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

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

  const handleOpenActivityOptions = () => {
    setShowActivityOptions(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseActivityOptions = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowActivityOptions(false);
    });
  };

  const handleNavigateToChallenges = () => {
    handleCloseActivityOptions();
    setTimeout(() => {
      (navigation as any).navigate("Challenges");
    }, 150);
  };

  const handleNavigateToTraining = () => {
    handleCloseActivityOptions();
    setTimeout(() => {
      (navigation as any).navigate("Training");
    }, 150);
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

  // Evolution chart data processing
  const evolutionChartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    // Calculate start date based on selected time period
    switch (selectedTimePeriod) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1m":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3m":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Filter sessions by activity type and date range
    const filteredSessions = sessions.filter((session) => {
      // Find the activity by looking through all activities for one that matches the session's challengeId
      const activity = activities.find((a) => a.id === session.challengeId);
      if (!activity) return false;

      const sessionDate = new Date(session.startTime);

      // Check if it's a training activity
      if (
        activity.type === selectedActivityType &&
        activity.type !== "attia-challenge"
      ) {
        return sessionDate >= startDate && sessionDate <= now;
      }

      // Check if it's a challenge activity
      if (
        selectedActivityType === "attia-challenge" &&
        activity.type === "attia-challenge" &&
        activity.attiaType === selectedChallengeType
      ) {
        return sessionDate >= startDate && sessionDate <= now;
      }

      return false;
    });

    // Create a data point for each session (show all activities, not just daily best)
    const chartDataPoints: { date: string; value: number }[] = [];

    filteredSessions.forEach((session) => {
      const activity = activities.find((a) => a.id === session.challengeId);
      if (!activity) return;

      // Use the actual session start time as the date
      const date = new Date(session.startTime).toISOString();

      let value = 0;

      // For training activities, use sum of splits (actual exercise time)
      if (activity.type !== "attia-challenge") {
        if (activity.type === "dynamometer") {
          // For dynamometer, use the activity's leftHandValue or rightHandValue
          value = Math.max(
            activity.leftHandValue || 0,
            activity.rightHandValue || 0
          );
        } else {
          // For hang and farmer-walk, calculate total exercise time from splits
          // Splits represent actual exercise time (excluding rest periods)
          const splitsArray = session.splits || [];
          const splitsSum = splitsArray.reduce(
            (sum, split) => sum + (split?.value || 0),
            0
          );

          // Only use splits data (most accurate) - skip sessions without valid splits
          if (splitsSum === 0 || splitsArray.length === 0) {
            return; // Skip sessions with no splits data
          }

          value = splitsSum;
        }
      }
      // For challenges, use totalElapsedTime
      else {
        value = session.totalElapsedTime || 0;
      }

      // Add this session as a data point
      chartDataPoints.push({ date, value });
    });

    // Sort by date (earliest to latest)
    chartDataPoints.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return chartDataPoints;
  }, [
    sessions,
    activities,
    selectedActivityType,
    selectedChallengeType,
    selectedTimePeriod,
  ]);

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
              color={Colors.attiaChallengeColor}
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
              color={Colors.attiaChallengeColor}
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
          style={[
            styles.exerciseCard,
            { borderColor: Colors.hangColor, borderWidth: 3 },
          ]}
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
            { borderColor: Colors.farmerWalksColor, borderWidth: 3 },
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
            { borderColor: Colors.dynamometerColor, borderWidth: 3 },
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
          onPress={handleOpenActivityOptions}
        >
          <Ionicons name="add" size={32} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Activity Options Modal */}
      <Modal
        visible={showActivityOptions}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseActivityOptions}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseActivityOptions}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Start New Activity</Text>
            <Text style={styles.modalSubtitle}>Choose where to begin</Text>

            <TouchableOpacity
              style={[styles.optionButton, styles.challengesButton]}
              onPress={handleNavigateToChallenges}
            >
              <Ionicons name="trophy" size={28} color={Colors.white} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Challenges</Text>
                <Text style={styles.optionDescription}>
                  Test your limits with benchmark challenges
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.white}
                style={styles.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.trainingButton]}
              onPress={handleNavigateToTraining}
            >
              <Ionicons name="barbell" size={28} color={Colors.white} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Training Ground</Text>
                <Text style={styles.optionDescription}>
                  Build strength with focused exercises
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.white}
                style={styles.chevron}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Evolution Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolution Graph</Text>

        {/* Activity Type Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedActivityType === "hang" && styles.filterButtonActive,
              { borderColor: Colors.hangColor },
            ]}
            onPress={() => setSelectedActivityType("hang")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedActivityType === "hang" && { color: Colors.hangColor },
              ]}
            >
              Hang
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedActivityType === "farmer-walk" &&
                styles.filterButtonActive,
              { borderColor: Colors.farmerWalksColor },
            ]}
            onPress={() => setSelectedActivityType("farmer-walk")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedActivityType === "farmer-walk" && {
                  color: Colors.farmerWalksColor,
                },
              ]}
            >
              Farmer Walk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedActivityType === "dynamometer" &&
                styles.filterButtonActive,
              { borderColor: Colors.dynamometerColor },
            ]}
            onPress={() => setSelectedActivityType("dynamometer")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedActivityType === "dynamometer" && {
                  color: Colors.dynamometerColor,
                },
              ]}
            >
              Dynamometer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Type Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedActivityType === "attia-challenge" &&
                selectedChallengeType === "hang" &&
                styles.filterButtonActive,
              { borderColor: Colors.attiaChallengeColor },
            ]}
            onPress={() => {
              setSelectedActivityType("attia-challenge");
              setSelectedChallengeType("hang");
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedActivityType === "attia-challenge" &&
                  selectedChallengeType === "hang" && {
                    color: Colors.attiaChallengeColor,
                  },
              ]}
            >
              Attia Challenge
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedActivityType === "attia-challenge" &&
                selectedChallengeType === "farmer-walk" &&
                styles.filterButtonActive,
              { borderColor: Colors.attiaChallengeColor },
            ]}
            onPress={() => {
              setSelectedActivityType("attia-challenge");
              setSelectedChallengeType("farmer-walk");
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedActivityType === "attia-challenge" &&
                  selectedChallengeType === "farmer-walk" && {
                    color: Colors.attiaChallengeColor,
                  },
              ]}
            >
              Attia Farmer Walk
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Period Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTimePeriod === "7d" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedTimePeriod("7d")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedTimePeriod === "7d" && { color: Colors.themeColor },
              ]}
            >
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTimePeriod === "1m" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedTimePeriod("1m")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedTimePeriod === "1m" && { color: Colors.themeColor },
              ]}
            >
              1 Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTimePeriod === "3m" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedTimePeriod("3m")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedTimePeriod === "3m" && { color: Colors.themeColor },
              ]}
            >
              3 Months
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart or Empty State */}
        {evolutionChartData.length > 0 ? (
          <SimpleLineChart
            data={evolutionChartData}
            color={
              selectedActivityType === "hang"
                ? Colors.hangColor
                : selectedActivityType === "farmer-walk"
                ? Colors.farmerWalksColor
                : selectedActivityType === "dynamometer"
                ? Colors.dynamometerColor
                : selectedActivityType === "attia-challenge"
                ? Colors.attiaChallengeColor
                : Colors.hangColor
            }
            height={200}
            unit={
              selectedActivityType === "hang"
                ? "s"
                : selectedActivityType === "farmer-walk"
                ? "m"
                : selectedActivityType === "dynamometer"
                ? "kg"
                : selectedActivityType === "attia-challenge"
                ? "s"
                : "s"
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Start your journey</Text>
            <Text style={styles.emptyStateText}>
              Start your first activity to start your journey!
            </Text>
            <Text style={styles.emptyStateText}>
              Click on the plus sign above
            </Text>
          </View>
        )}
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
    // backgroundColor: Colors.darkGray,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.attiaChallengeColor,
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
    color: Colors.white,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
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
    color: Colors.white,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: Colors.themeColor,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengesButton: {
    borderColor: Colors.themeColor,
    borderWidth: 3,
  },
  trainingButton: {
    borderColor: Colors.themeColor,
    borderWidth: 3,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  chevron: {
    marginLeft: 8,
  },
  addWorkoutButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.themeColor,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignSelf: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
    alignItems: "center",
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lightGray,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.black,
  },
  emptyStateTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyStateText: {
    color: Colors.lightGray,
    fontSize: 14,
    textAlign: "center",
  },
});
