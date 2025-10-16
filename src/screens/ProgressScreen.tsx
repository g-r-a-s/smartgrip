import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  DynamometerChart,
  FarmerWalkChart,
  HangChart,
} from "../components/charts";
import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { ActivityType } from "../types/activities";

type FilterType = ActivityType;

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

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadSessions();
        loadActivities();
      }
    }, [user, loadSessions, loadActivities])
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

  const renderChart = () => {
    switch (filter) {
      case "hang":
        return <HangChart activities={activities} sessions={sessions} />;
      case "farmer-walk":
        return <FarmerWalkChart activities={activities} sessions={sessions} />;
      case "dynamometer":
        return <DynamometerChart activities={activities} sessions={sessions} />;
      default:
        return <HangChart activities={activities} sessions={sessions} />;
    }
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
});
