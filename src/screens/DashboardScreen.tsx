import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import SimpleLineChart from "../components/charts/SimpleLineChart";
import Colors from "../constants/colors";
import { useData } from "../hooks/useData";

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
  const [refreshing, setRefreshing] = React.useState(false);

  // Evolution chart filters
  const [selectedActivityType, setSelectedActivityType] =
    useState<string>("hang");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("7d");
  const [selectedChallengeType, setSelectedChallengeType] =
    useState<string>("hang");

  // Dropdown state
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const exerciseOptions = useMemo(
    () => [
      { label: "Hang", activityType: "hang" as const },
      { label: "Farmer Walk", activityType: "farmer-walk" as const },
      { label: "Dynamometer", activityType: "dynamometer" as const },
      {
        label: "Attia Hang Challenge",
        activityType: "attia-challenge" as const,
        challengeType: "hang" as const,
      },
      {
        label: "Attia Farmer Walk Challenge",
        activityType: "attia-challenge" as const,
        challengeType: "farmer-walk" as const,
      },
    ],
    []
  );

  const periodOptions = useMemo(
    () => [
      { label: "7 Days", value: "7d" },
      { label: "1 Month", value: "1m" },
      { label: "3 Months", value: "3m" },
    ],
    []
  );

  const selectedExerciseOption = useMemo(() => {
    return (
      exerciseOptions.find((option) => {
        if (option.activityType !== selectedActivityType) return false;
        if (option.activityType === "attia-challenge") {
          return option.challengeType === selectedChallengeType;
        }
        return true;
      }) ?? exerciseOptions[0]
    );
  }, [exerciseOptions, selectedActivityType, selectedChallengeType]);

  const selectedPeriodOption = useMemo(() => {
    return (
      periodOptions.find((option) => option.value === selectedTimePeriod) ??
      periodOptions[0]
    );
  }, [periodOptions, selectedTimePeriod]);

  const handleSelectExercise = (option: (typeof exerciseOptions)[number]) => {
    setSelectedActivityType(option.activityType);
    if (option.activityType === "attia-challenge") {
      setSelectedChallengeType(option.challengeType ?? "hang");
    } else {
      setSelectedChallengeType("hang");
    }
    setShowExerciseDropdown(false);
  };

  const handleSelectPeriod = (option: (typeof periodOptions)[number]) => {
    setSelectedTimePeriod(option.value);
    setShowPeriodDropdown(false);
  };

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

  const challengeProgress = useMemo(
    () => [
      {
        key: "attia-hang",
        title: "Attia Hang",
        percentage: getProgressPercentage(
          challengeStats.hang.best,
          getAttiaChallengeTarget("hang")
        ),
        best: formatValue(challengeStats.hang.best, challengeStats.hang.metric),
        target: formatValue(
          getAttiaChallengeTarget("hang"),
          challengeStats.hang.metric
        ),
      },
      {
        key: "attia-farmer",
        title: "Attia Farmer Walk",
        percentage: getProgressPercentage(
          challengeStats["farmer-walk"].best,
          getAttiaChallengeTarget("farmer-walk")
        ),
        best: formatValue(
          challengeStats["farmer-walk"].best,
          challengeStats["farmer-walk"].metric
        ),
        target: formatValue(
          getAttiaChallengeTarget("farmer-walk"),
          challengeStats["farmer-walk"].metric
        ),
      },
    ],
    [challengeStats]
  );

  const trainingHighlights = useMemo(
    () => [
      {
        key: "hang",
        title: "Hang",
        accentColor: Colors.accentGreen,
        metrics: [
          {
            label: "Best",
            value: formatValue(exerciseStats.hang.best, "seconds"),
            icon: "trophy-outline",
          },
          {
            label: "Average",
            value: formatValue(exerciseStats.hang.average, "seconds"),
          },
          {
            label: "Sessions",
            value: `${exerciseStats.hang.totalSessions}`,
          },
        ],
      },
      {
        key: "farmer-walk",
        title: "Farmer Walk",
        accentColor: Colors.accentPurple,
        metrics: [
          {
            label: "Best",
            value: formatValue(exerciseStats["farmer-walk"].best, "meters"),
            icon: "trophy-outline",
          },
          {
            label: "Average",
            value: formatValue(exerciseStats["farmer-walk"].average, "meters"),
          },
          {
            label: "Sessions",
            value: `${exerciseStats["farmer-walk"].totalSessions}`,
          },
        ],
      },
      {
        key: "dynamometer",
        title: "Dynamometer",
        accentColor: Colors.accentBlue,
        metrics: [
          {
            label: "Left Best",
            value: formatValue(
              exerciseStats.dynamometer.leftHand?.best ?? 0,
              "kg"
            ),
            icon: "trophy-outline",
          },
          {
            label: "Right Best",
            value: formatValue(
              exerciseStats.dynamometer.rightHand?.best ?? 0,
              "kg"
            ),
          },
          {
            label: "Sessions",
            value: `${exerciseStats.dynamometer.totalSessions}`,
          },
        ],
      },
    ],
    [exerciseStats]
  );

  const activityFilters = [
    { value: "hang", label: "Hang", accent: Colors.accentOrange },
    {
      value: "farmer-walk",
      label: "Farmer Walk",
      accent: Colors.farmerWalksColor,
    },
    {
      value: "dynamometer",
      label: "Dynamometer",
      accent: Colors.dynamometerColor,
    },
    {
      value: "attia-challenge",
      label: "Attia Challenge",
      accent: Colors.attiaChallengeColor,
    },
  ];

  const attiaFilters = [
    { value: "hang", label: "Hang", accent: Colors.attiaChallengeColor },
    {
      value: "farmer-walk",
      label: "Farmer Walk",
      accent: Colors.attiaChallengeColor,
    },
  ];

  const timeFilters = [
    { value: "7d", label: "7 Days" },
    { value: "1m", label: "1 Month" },
    { value: "3m", label: "3 Months" },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Svg style={styles.backgroundGradient} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient
            id="dashboardGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#ffe6d2" />
            <Stop offset="55%" stopColor="#f8d0bc" />
            <Stop offset="100%" stopColor="#ded6d3" />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#dashboardGradient)"
        />
      </Svg>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and achievements
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons
                    name="trophy-outline"
                    size={20}
                    color={Colors.textPrimaryHigh}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Challenges Progress</Text>
                </View>
              </View>
              <View style={styles.challengeRow}>
                {challengeProgress.map((item, index) => (
                  <View
                    key={item.key}
                    style={[
                      styles.challengeCard,
                      index === challengeProgress.length - 1 &&
                        styles.challengeCardLast,
                    ]}
                  >
                    <Text style={styles.challengeCardTitle}>{item.title}</Text>
                    <Text style={styles.challengePercent}>
                      {Math.round(item.percentage)}%
                    </Text>
                    <View style={styles.challengeMetaRow}>
                      <Text style={styles.challengeMetaText}>
                        Best {item.best}
                      </Text>
                      <View style={styles.metaDivider} />
                      <Text style={styles.challengeMetaText}>
                        Target {item.target}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons
                    name="barbell-outline"
                    size={20}
                    color={Colors.textPrimaryHigh}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Training Performance</Text>
                </View>
              </View>

              <View style={styles.trainingList}>
                {trainingHighlights.map((item) => (
                  <View key={item.key} style={styles.trainingCard}>
                    <View
                      style={[
                        styles.trainingBadge,
                        { backgroundColor: item.accentColor },
                      ]}
                    >
                      <Text style={styles.trainingBadgeText}>{item.title}</Text>
                    </View>
                    <View style={styles.trainingMetricsRow}>
                      {item.metrics.map((metric, metricIndex) => (
                        <React.Fragment key={metric.label}>
                          <View style={styles.trainingMetric}>
                            <Text style={styles.trainingMetricLabel}>
                              {metric.label}
                            </Text>
                            <View style={styles.metricValueRow}>
                              {metric.icon && (
                                <Ionicons
                                  name={
                                    metric.icon as keyof typeof Ionicons.glyphMap
                                  }
                                  size={18}
                                  color={
                                    metric.icon === "trophy-outline"
                                      ? Colors.accentGold
                                      : item.accentColor
                                  }
                                  style={styles.metricIcon}
                                />
                              )}
                              <Text style={styles.trainingMetricValue}>
                                {metric.value}
                              </Text>
                            </View>
                          </View>
                          {metricIndex < item.metrics.length - 1 && (
                            <View style={styles.metricDivider} />
                          )}
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionCard, styles.evolutionCard]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={20}
                    color={Colors.textPrimaryHigh}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Evolution Graph</Text>
                </View>
              </View>

              <View style={styles.dropdownStack}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setShowExerciseDropdown(true)}
                >
                  <Text style={styles.dropdownLabel}>
                    {selectedExerciseOption.label}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={Colors.textSecondaryHigh}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setShowPeriodDropdown(true)}
                >
                  <Text style={styles.dropdownLabel}>
                    {selectedPeriodOption.label}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={Colors.textSecondaryHigh}
                  />
                </TouchableOpacity>
              </View>

              {evolutionChartData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <SimpleLineChart
                    data={evolutionChartData}
                    color={
                      selectedActivityType === "hang"
                        ? Colors.hangColor
                        : selectedActivityType === "farmer-walk"
                        ? Colors.farmerWalksColor
                        : selectedActivityType === "dynamometer"
                        ? Colors.dynamometerColor
                        : Colors.attiaChallengeColor
                    }
                    height={200}
                    unit={
                      selectedActivityType === "hang"
                        ? "s"
                        : selectedActivityType === "farmer-walk"
                        ? "m"
                        : selectedActivityType === "dynamometer"
                        ? "kg"
                        : "s"
                    }
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Start your journey</Text>
                  <Text style={styles.emptyText}>
                    Launch your first activity to see progress trends.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showExerciseDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExerciseDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowExerciseDropdown(false)}
        >
          <View style={styles.dropdownCard}>
            {exerciseOptions.map((option) => {
              const isSelected =
                option.activityType === selectedActivityType &&
                (option.activityType !== "attia-challenge" ||
                  option.challengeType === selectedChallengeType);
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleSelectExercise(option)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionLabel,
                      isSelected && styles.dropdownOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showPeriodDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPeriodDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodDropdown(false)}
        >
          <View style={styles.dropdownCard}>
            {periodOptions.map((option) => {
              const isSelected = option.value === selectedTimePeriod;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    isSelected && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleSelectPeriod(option)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionLabel,
                      isSelected && styles.dropdownOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.appBackground },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
  },
  scroll: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingBottom: 120 },
  content: {
    paddingHorizontal: 12,
    paddingTop: 70,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  headerSubtitle: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 16,
    color: Colors.textSecondaryHigh,
  },
  section: {
    // marginTop: 28,
  },
  sectionCard: {
    borderRadius: 28,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  sectionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(26, 29, 31, 0.08)",
  },
  sectionTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
  },
  challengeRow: {
    flexDirection: "row",
    marginTop: 18,
    alignItems: "stretch",
  },
  challengeCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 20,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginRight: 12,
    elevation: 6,
  },
  challengeCardLast: {
    marginRight: 0,
  },
  challengeCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
  },
  challengePercent: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  challengeMetaRow: {
    marginTop: 12,
    // flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "space-between",
  },
  challengeMetaText: {
    fontSize: 12,
    color: Colors.textMutedHigh,
  },
  metaDivider: {
    width: 1,
    backgroundColor: "rgba(26, 29, 31, 0.12)",
    marginHorizontal: 8,
    alignSelf: "stretch",
  },
  trainingList: {
    marginTop: 20,
  },
  trainingCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(26, 29, 31, 0.05)",
    shadowColor: "#1a1d2c",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  trainingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 24,
  },
  trainingBadgeText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 18,
  },
  trainingMetricsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginTop: 28,
  },
  trainingMetric: {
    flex: 1,
    alignItems: "center",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  metricIcon: {
    marginRight: 6,
  },
  trainingMetricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  trainingMetricLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
    marginBottom: 6,
    textTransform: "none",
  },
  metricDivider: {
    width: 1,
    height: "70%",
    marginHorizontal: 20,
    backgroundColor: "rgba(26, 29, 31, 0.12)",
    borderRadius: 1,
    alignSelf: "center",
  },
  fabContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentOrange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accentOrange,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 12,
  },
  fabLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
  },
  evolutionCard: {
    marginTop: 0,
  },
  dropdownStack: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardSurface,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dropdownCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(26, 29, 31, 0.06)",
  },
  dropdownOptionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondaryHigh,
  },
  dropdownOptionLabelSelected: {
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  chartTick: {
    fontSize: 11,
    color: Colors.textMutedHigh,
  },
  emptyState: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: Colors.cardSurface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimaryHigh,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondaryHigh,
    textAlign: "center",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.appBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondaryHigh,
  },
});
