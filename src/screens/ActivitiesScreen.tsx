import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { ButtonTitles } from "./constants/constants";

export default function ActivitiesScreen() {
  const handleHangPress = () => {
    console.log("Hang Activity selected");
  };

  const handleFarmerWalksPress = () => {
    console.log("Farmer walks Activity selected");
  };

  const handleDynamometerPress = () => {
    console.log("Dynamometer Activity selected");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>What's on your mind today ?</Text>

      <View style={styles.buttonsContainer}>
        <Button
          title={ButtonTitles.HANG}
          color={Colors.hangColor}
          onPress={handleHangPress}
        />
        <Button
          title={ButtonTitles.FARMER_WALKS}
          color={Colors.farmerWalksColor}
          onPress={handleFarmerWalksPress}
        />
        <Button
          title={ButtonTitles.DYNAMOMETER}
          color={Colors.dynamometerColor}
          onPress={handleDynamometerPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 100,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
