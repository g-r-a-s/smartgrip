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
    backgroundColor: Colors.darkGray,
    backgroundGradientFrom: Colors.darkGray,
    backgroundGradientTo: Colors.darkGray,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      color +
      Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, "0"),
    labelColor: (opacity = 1) => Colors.text,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: Colors.border + "50",
    },
    // Make labels more visible
    fillShadowGradient: color,
    fillShadowGradientOpacity: 0.1,
  };

  return (
    <View style={[styles.container, { height }]}>
      <LineChart
        data={chartData}
        width={width - 60} // Account for padding
        height={height - 20}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withVerticalLabels={false}
        withHorizontalLabels={true}
        withInnerLines={true}
        withOuterLines={true}
        formatYLabel={unit ? (value) => `${value}${unit}` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    borderRadius: 12,
  },
  noDataText: {
    color: Colors.lightGray,
    textAlign: "center",
    fontSize: 14,
  },
});
