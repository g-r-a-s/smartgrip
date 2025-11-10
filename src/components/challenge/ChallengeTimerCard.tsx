import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import Colors from "../../constants/colors";

interface ChallengeTimerCardProps {
  title: string;
  subtitle?: string;
  contextLabel?: string;
  accentColor?: string;
  elapsedSeconds: number;
  totalSeconds: number;
  displaySeconds: number;
  isCountingDown?: boolean;
  countdownSeconds?: number;
  onReset?: () => void;
  onClose?: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  primaryActionDisabled?: boolean;
  startLabel?: string;
  endLabel?: string;
}

const TIMER_SIZE = 220;
const STROKE_WIDTH = 12;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safeSeconds % 60).toString().padStart(2, "0");
  return { mins, secs };
}

export default function ChallengeTimerCard({
  title,
  subtitle,
  contextLabel,
  accentColor = Colors.accentOrange,
  elapsedSeconds,
  totalSeconds,
  displaySeconds,
  isCountingDown = false,
  countdownSeconds,
  onReset,
  onClose,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionDisabled,
  startLabel = "0s",
  endLabel,
}: ChallengeTimerCardProps) {
  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return Math.min(Math.max(elapsedSeconds / totalSeconds, 0), 1);
  }, [elapsedSeconds, totalSeconds]);

  const strokeDashoffset = useMemo(() => {
    return CIRCUMFERENCE * (1 - progress);
  }, [progress]);

  console.log("displaySeconds", displaySeconds);

  const { mins, secs } = formatTime(displaySeconds);
  const endLabelText = endLabel ?? `${Math.round(totalSeconds)}s`;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {onClose ? (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.timerWrapper}>
          <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
            <Circle
              stroke="rgba(255, 255, 255, 0.1)"
              fill="transparent"
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              stroke={accentColor}
              fill="transparent"
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timeContent}>
            {isCountingDown && countdownSeconds !== undefined ? (
              <Text style={styles.countdownText}>{countdownSeconds}</Text>
            ) : (
              <>
                <View style={styles.timeRow}>
                  <Text style={styles.timeValue}>{mins}</Text>
                  <Text style={styles.timeColon}>:</Text>
                  <Text style={styles.timeValue}>{secs}</Text>
                </View>
                <View style={styles.timeLabelsRow}>
                  <Text style={styles.timeLabel}>Minutes</Text>
                  <Text style={styles.timeLabel}>Seconds</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerTextBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {contextLabel ? (
              <Text style={styles.contextLabel}>{contextLabel}</Text>
            ) : null}
          </View>
          <View style={styles.footerActions}>
            {onPrimaryAction && primaryActionLabel ? (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accentColor }]}
                onPress={onPrimaryAction}
                disabled={primaryActionDisabled}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {primaryActionLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
            {onReset ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onReset}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color="rgba(255, 255, 255, 0.75)"
                />
                <Text style={styles.secondaryButtonText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>
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
    borderRadius: 50,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: "rgba(16, 18, 23, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#0f1014",
    shadowOpacity: 0.32,
    shadowRadius: 28,
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
    fontSize: 44,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
    letterSpacing: 1,
  },
  timeColon: {
    fontSize: 44,
    fontFamily: "Lufga-Bold",
    color: "rgba(255, 255, 255, 0.72)",
    marginHorizontal: 4,
  },
  timeLabelsRow: {
    flexDirection: "row",
    gap: 56,
    marginTop: 6,
  },
  timeLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.62)",
    letterSpacing: 0.8,
    fontFamily: "Lufga-Regular",
  },
  countdownText: {
    fontSize: 52,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  scaleRow: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Lufga-Regular",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Lufga-Regular",
    marginTop: 4,
  },
  contextLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 8,
    letterSpacing: 0.6,
    fontFamily: "Lufga-Regular",
  },
  footerActions: {
    gap: 12,
    alignItems: "flex-end",
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  primaryButtonText: {
    color: Colors.tabBarGlassBackground,
    fontFamily: "Lufga-Bold",
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "rgba(12, 13, 18, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  secondaryButtonText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 14,
    fontFamily: "Lufga-Bold",
  },
});
