import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Colors from "../../constants/colors";

const { width } = Dimensions.get("window");

interface ChartDataPoint {
  date: string;
  value: number;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  color: string;
  height?: number;
  unit?: string;
}

export default function SimpleLineChart({
  data,
  color,
  height = 150,
  unit,
}: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // Prepare data for react-native-chart-kit
  const chartData = {
    labels: data.map((point) => {
      const date = new Date(point.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: data.map((point) => point.value),
        color: (opacity = 1) =>
          color +
          Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0"),
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.white,
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      color +
      Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, "0"),
    labelColor: () => Colors.textMutedHigh,
    propsForDots: {
      r: "0.5",
      strokeWidth: "2",
      stroke: color,
      fill: color,
    },
    // Make labels more visible
    fillShadowGradient: color,
    fillShadowGradientOpacity: 0.1,
    propsForLabels: {
      fontSize: 12,
      fontWeight: "600",
    },
  };

  return (
    <View style={[styles.container, { height }]}>
      <LineChart
        data={chartData}
        width={width - 48}
        height={height - 20}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        yLabelsOffset={12}
        xLabelsOffset={8}
        withInnerLines={true}
        withOuterLines={true}
        formatYLabel={
          unit
            ? (value) => `${Math.round(parseFloat(value))}${unit}`
            : undefined
        }
        formatXLabel={() => ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: "stretch",
    justifyContent: "center",
    shadowColor: "#1a1d2c",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  chart: {
    borderRadius: 18,
  },
  noDataText: {
    color: Colors.textMutedHigh,
    textAlign: "center",
    fontSize: 14,
  },
});
