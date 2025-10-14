import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type FarmerWalkActivityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmerWalkActivity"
>;

export default function FarmerWalkActivityScreen() {
  const navigation = useNavigation<FarmerWalkActivityScreenNavigationProp>();

  const handleWalkForDistancePress = () => {
    navigation.navigate("FarmerWalkDistanceInput");
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Button
          title="WALK FOR DISTANCE"
          color={Colors.farmerWalksColor}
          onPress={handleWalkForDistancePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
