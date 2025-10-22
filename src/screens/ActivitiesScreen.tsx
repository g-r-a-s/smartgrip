import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
    navigation.navigate("DynamometerActivity");
  };

  const handleChallengesPress = () => {
    navigation.navigate("Challenges");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test yourself</Text>
          <View style={styles.buttonsContainer}>
            <Button
              title="CHALLENGES"
              color={Colors.attiaChallengeColor}
              onPress={handleChallengesPress}
            />
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <Text style={styles.sectionSubtitle}>Get better</Text>
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
    marginBottom: 40,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 10,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
