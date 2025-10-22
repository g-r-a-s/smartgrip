import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type ActivitiesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Activities"
>;

export default function ActivitiesScreen() {
  const navigation = useNavigation<ActivitiesScreenNavigationProp>();

  const handleChallengesPress = () => {
    navigation.navigate("Challenges");
  };

  const handleTrainingGroundPress = () => {
    navigation.navigate("TrainingGround");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Challenges Section */}
        <View style={styles.section}>
          <View style={styles.buttonsContainer}>
            <Button
              title="CHALLENGES"
              color={Colors.attiaChallengeColor}
              onPress={handleChallengesPress}
            />
          </View>
        </View>

        {/* Training Ground Section */}
        <View style={styles.section}>
          <View style={styles.buttonsContainer}>
            <Button
              title="TRAINING GROUND"
              color={Colors.hangColor}
              onPress={handleTrainingGroundPress}
            />
          </View>
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
  },
  section: {
    alignItems: "center",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
