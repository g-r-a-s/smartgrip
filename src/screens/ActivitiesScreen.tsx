import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";
import { ButtonTitles } from "./constants/constants";

type ActivitiesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Activities"
>;

export default function ActivitiesScreen() {
  const navigation = useNavigation<ActivitiesScreenNavigationProp>();

  const handleHangPress = () => {
    navigation.navigate("HangActivity");
  };

  const handleFarmerWalksPress = () => {
    navigation.navigate("FarmerWalkActivity");
  };

  const handleDynamometerPress = () => {
    console.log("Dynamometer Activity selected");
  };

  return (
    <View style={styles.container}>
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
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
