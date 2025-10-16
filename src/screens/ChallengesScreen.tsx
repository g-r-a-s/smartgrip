import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type ChallengesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Challenges"
>;

export default function ChallengesScreen() {
  const navigation = useNavigation<ChallengesScreenNavigationProp>();

  const handleAttiaHangPress = () => {
    navigation.navigate("AttiaChallenge", { challengeType: "hang" });
  };

  const handleAttiaFarmerWalkPress = () => {
    navigation.navigate("AttiaChallenge", { challengeType: "farmer-walk" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Button
          title="ATTIA HANG"
          color={Colors.attiaChallengeColor}
          onPress={handleAttiaHangPress}
        />
        <Button
          title="ATTIA FARMER WALK"
          color={Colors.attiaChallengeColor}
          onPress={handleAttiaFarmerWalkPress}
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
