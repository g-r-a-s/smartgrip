import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type TrainingGroundScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TrainingGround"
>;

export default function TrainingGroundScreen() {
  const navigation = useNavigation<TrainingGroundScreenNavigationProp>();

  const handleHangPress = () => {
    navigation.navigate("HangTimeInput");
  };

  const handleFarmerWalksPress = () => {
    navigation.navigate("FarmerWalkDistanceInput");
  };

  const handleDynamometerPress = () => {
    navigation.navigate("DynamometerInput");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Training Ground</Text>
        <Text style={styles.subtitle}>Build your strength and endurance</Text>

        <View style={styles.buttonsContainer}>
          <Button
            title="HANG FOR TIME"
            color={Colors.hangColor}
            onPress={handleHangPress}
          />
          <Button
            title="WALK FOR DISTANCE"
            color={Colors.farmerWalksColor}
            onPress={handleFarmerWalksPress}
          />
          <Button
            title="DYNAMOMETER"
            color={Colors.dynamometerColor}
            onPress={handleDynamometerPress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 40,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
