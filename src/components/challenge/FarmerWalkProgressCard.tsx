import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import Colors from "../../constants/colors";

interface FarmerWalkProgressCardProps {
  coveredDistance: number;
  targetDistance: number;
  weightPerHand: number;
  onReset?: () => void;
  onClose?: () => void;
}

const CARD_SIZE = 240;
const STROKE_WIDTH = 12;
const RADIUS = (CARD_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatMeters = (value: number) => `${Math.max(Math.round(value), 0)}m`;
const formatWeight = (value: number) => `${Math.round(value * 10) / 10}kg`;

export default function FarmerWalkProgressCard({
  coveredDistance,
  targetDistance,
  weightPerHand,
  onReset,
  onClose,
}: FarmerWalkProgressCardProps) {
  const progress = useMemo(() => {
    if (targetDistance <= 0) return 0;
    return Math.min(Math.max(coveredDistance / targetDistance, 0), 1);
  }, [coveredDistance, targetDistance]);

  const strokeDashoffset = useMemo(
    () => CIRCUMFERENCE * (1 - progress),
    [progress]
  );

  const remainingDistance = Math.max(targetDistance - coveredDistance, 0);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {onClose ? (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.timerWrapper}>
          <Svg width={CARD_SIZE} height={CARD_SIZE}>
            <Circle
              stroke="rgba(255, 255, 255, 0.16)"
              fill="transparent"
              cx={CARD_SIZE / 2}
              cy={CARD_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              stroke={Colors.farmerWalksColor}
              fill="transparent"
              cx={CARD_SIZE / 2}
              cy={CARD_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${CARD_SIZE / 2} ${CARD_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timeContent}>
            <View style={styles.timeRow}>
              <Text style={styles.timeValue}>
                {formatMeters(coveredDistance)}
              </Text>
              <Text style={styles.timeSeparator}>/</Text>
              <Text style={styles.timeValue}>
                {formatMeters(targetDistance)}
              </Text>
            </View>
            <View style={styles.timeLabelsRow}>
              <Text style={styles.timeLabel}>Covered</Text>
              <Text style={styles.timeLabel}>Remaining</Text>
            </View>
            <View style={styles.remainingRow}>
              <Text style={styles.remainingValue}>
                {formatMeters(remainingDistance)} left
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Target</Text>
            <Text style={styles.detailValue}>
              {formatMeters(targetDistance)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Weight per hand</Text>
            <Text style={styles.detailValue}>
              {formatWeight(weightPerHand)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onReset ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={onReset}>
              <Ionicons
                name="refresh-outline"
                size={18}
                color="rgba(255, 255, 255, 0.85)"
              />
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 40,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "rgba(16, 18, 22, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#0d1014",
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  timeContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeValue: {
    fontSize: 34,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  timeSeparator: {
    fontSize: 32,
    fontFamily: "Lufga-Bold",
    color: "rgba(255, 255, 255, 0.7)",
    marginHorizontal: 8,
  },
  timeLabelsRow: {
    flexDirection: "row",
    gap: 60,
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    fontFamily: "Lufga-Regular",
  },
  remainingRow: {
    marginTop: 12,
  },
  remainingValue: {
    fontSize: 15,
    color: Colors.white,
    fontFamily: "Lufga-Regular",
  },
  detailRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Lufga-Regular",
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 18,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  actionsRow: {
    alignItems: "flex-end",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  secondaryButtonText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontFamily: "Lufga-Bold",
  },
});
