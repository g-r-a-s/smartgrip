import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type FilterType = "all" | ActivityType;

export default function HistoryScreen() {
  const { user } = useAuth();
  const { sessions, activities, loadSessions, loadActivities, refreshAll } =
    useData();
  const [filter, setFilter] = useState<FilterType>("all");
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

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    const activity = activities.find((a) => a.id === session.challengeId);
    return activity?.type === filter;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
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

      {/* Sessions List */}
      <ScrollView
        style={styles.sessionsList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.hangColor}
            colors={[Colors.hangColor]}
          />
        }
      >
        {filteredSessions.length === 0 && !refreshing ? (
          <Text style={styles.emptyText}>
            {filter === "all"
              ? "No activities yet. Start training to see your history!"
              : `No ${getActivityName(filter as ActivityType)} activities yet.`}
          </Text>
        ) : refreshing && filteredSessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.hangColor} />
            <Text style={styles.loadingText}>Loading your history...</Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const activity = activities.find(
              (a) => a.id === session.challengeId
            );
            if (!activity) return null;

            return (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  { borderLeftColor: getActivityColor(activity.type) },
                ]}
              >
                <View style={styles.sessionHeader}>
                  <View
                    style={[
                      styles.activityBadge,
                      { backgroundColor: getActivityColor(activity.type) },
                    ]}
                  >
                    <Text style={styles.activityBadgeText}>
                      {getActivityName(activity.type).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.sessionDate}>
                    {new Date(session.startTime).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.sessionDetails}>
                  {activity.type === "hang" && (
                    <>
                      <Text style={styles.sessionInfo}>
                        Target: {formatTime(activity.targetTime)}
                      </Text>
                      <Text style={styles.sessionInfo}>
                        Splits: {session.splits.length}
                      </Text>
                      <Text style={styles.sessionInfo}>
                        Total Time: {formatTime(session.totalElapsedTime || 0)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
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
    marginBottom: 20,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
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
  sessionsList: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 40,
  },
  sessionCard: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    // borderLeftColor will be set dynamically based on activity type
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activityBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  sessionDate: {
    color: Colors.gray,
    fontSize: 14,
  },
  sessionDetails: {
    gap: 5,
  },
  sessionInfo: {
    color: Colors.white,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 10,
  },
});
