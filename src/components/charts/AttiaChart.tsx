import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/colors";
import {
  Activity,
  ActivitySession,
  AttiaChallengeActivity,
} from "../../types/activities";

interface AttiaChartProps {
  activities: Activity[];
  sessions: ActivitySession[];
}

const chartWidth = Dimensions.get("window").width - 40;

export default function AttiaChart({ activities, sessions }: AttiaChartProps) {
  // Filter for attia-challenge activities and sessions
  const attiaActivities = activities.filter(
    (activity) => activity.type === "attia-challenge"
  ) as AttiaChallengeActivity[];
  const attiaSessions = sessions.filter((session) =>
    attiaActivities.some((activity) => activity.id === session.challengeId)
  );

  // Separate hang and farmer walk challenges
  const hangActivities = attiaActivities.filter(
    (activity) => activity.attiaType === "hang"
  );
  const farmerWalkActivities = attiaActivities.filter(
    (activity) => activity.attiaType === "farmer-walk"
  );
  const hangSessions = attiaSessions.filter((session) =>
    hangActivities.some((activity) => activity.id === session.challengeId)
  );
  const farmerWalkSessions = attiaSessions.filter((session) =>
    farmerWalkActivities.some((activity) => activity.id === session.challengeId)
  );

  // Group sessions by date
  const groupSessionsByDate = (
    sessions: ActivitySession[],
    activities: AttiaChallengeActivity[]
  ) => {
    const grouped: {
      [key: string]: {
        session: ActivitySession;
        activity: AttiaChallengeActivity;
      }[];
    } = {};

    sessions.forEach((session) => {
      const activity = activities.find((a) => a.id === session.challengeId);
      if (activity) {
        const dateKey = new Date(session.startTime).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push({ session, activity });
      }
    });

    return Object.entries(grouped)
      .map(([date, sessions]) => ({
        date,
        sessions: sessions.sort(
          (a, b) =>
            new Date(a.session.startTime).getTime() -
            new Date(b.session.startTime).getTime()
        ),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const hangChartData = groupSessionsByDate(hangSessions, hangActivities);
  const farmerWalkChartData = groupSessionsByDate(
    farmerWalkSessions,
    farmerWalkActivities
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isHangSuccess = (
    session: ActivitySession,
    activity?: AttiaChallengeActivity
  ): boolean => {
    if (!activity) return false;
    const targetTime = activity.targetTime || 120;
    return (session.totalElapsedTime || 0) >= targetTime;
  };

  const isFarmerWalkSuccess = (session: ActivitySession): boolean => {
    return (session.totalElapsedTime || 0) >= 60; // 1 minute for farmer walk
  };

  const getHangSuccessRate = (): number => {
    if (hangSessions.length === 0) return 0;
    const successes = hangSessions.filter((session) => {
      const activity = hangActivities.find((a) => a.id === session.challengeId);
      return activity && isHangSuccess(session, activity);
    }).length;
    return Math.round((successes / hangSessions.length) * 100);
  };

  const getFarmerWalkSuccessRate = (): number => {
    if (farmerWalkSessions.length === 0) return 0;
    const successes = farmerWalkSessions.filter((session) =>
      isFarmerWalkSuccess(session)
    ).length;
    return Math.round((successes / farmerWalkSessions.length) * 100);
  };

  const hangSuccessRate = getHangSuccessRate();
  const farmerWalkSuccessRate = getFarmerWalkSuccessRate();

  const renderChallengeSection = (
    title: string,
    chartData: Array<{
      date: string;
      sessions: Array<{
        session: ActivitySession;
        activity: AttiaChallengeActivity;
      }>;
    }>,
    sessions: ActivitySession[],
    activities: AttiaChallengeActivity[],
    isSuccess: (
      session: ActivitySession,
      activity?: AttiaChallengeActivity
    ) => boolean,
    successRate: number
  ) => {
    if (sessions.length === 0) return null;

    return (
      <View style={styles.challengeSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.successRateContainer}>
            <Text style={styles.successRateLabel}>Success Rate</Text>
            <Text style={styles.successRateValue}>{successRate}%</Text>
            <Text style={styles.successRateSubtitle}>
              {
                sessions.filter((s) => {
                  const activity = activities.find(
                    (a) => a.id === s.challengeId
                  );
                  return isSuccess(s, activity);
                }).length
              }{" "}
              / {sessions.length} attempts
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {chartData.map(({ date, sessions: daySessions }) => (
            <View key={date} style={styles.dateColumn}>
              <Text style={styles.dateLabel}>
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>

              <View style={styles.sessionsContainer}>
                {daySessions.map((sessionData, sessionIndex) => {
                  const { session, activity } = sessionData;
                  const success = isSuccess(session, activity);
                  const timeDisplay = session.totalElapsedTime
                    ? formatTime(session.totalElapsedTime)
                    : "0:00";

                  // Calculate bar width based on time achieved vs target
                  const targetTime =
                    activity.attiaType === "hang"
                      ? activity.targetTime || 120
                      : 60;
                  const availableWidth = chartWidth - 60;
                  const barWidth = Math.min(
                    ((session.totalElapsedTime || 0) / targetTime) *
                      availableWidth,
                    availableWidth
                  );

                  return (
                    <View key={sessionIndex} style={styles.sessionRow}>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.splitSegment,
                            {
                              width: barWidth,
                              left: 0,
                              backgroundColor: success
                                ? Colors.attiaChallengeColor
                                : Colors.fail,
                            },
                          ]}
                        >
                          <Text style={styles.splitDurationText}>
                            {timeDisplay}
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
    );
  };

  return (
    <View style={styles.container}>
      {renderChallengeSection(
        "Hang Challenge",
        hangChartData,
        hangSessions,
        hangActivities,
        isHangSuccess,
        hangSuccessRate
      )}

      {renderChallengeSection(
        "Farmer Walk Challenge",
        farmerWalkChartData,
        farmerWalkSessions,
        farmerWalkActivities,
        isFarmerWalkSuccess,
        farmerWalkSuccessRate
      )}

      {attiaSessions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Attia Challenge attempts yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  challengeSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  successRateContainer: {
    alignItems: "flex-end",
  },
  successRateLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 2,
  },
  successRateValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.attiaChallengeColor,
  },
  successRateSubtitle: {
    fontSize: 10,
    color: Colors.lightGray,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
  },
});
