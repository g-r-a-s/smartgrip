import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Colors from "../constants/colors";
import { RootStackParamList } from "../navigation/StackNavigator";

type HangActivityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "HangActivity"
>;

export default function HangActivityScreen() {
  const navigation = useNavigation<HangActivityScreenNavigationProp>();

  const handleHangForTimePress = () => {
    navigation.navigate("HangTimeInput");
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Button
          title="HANG FOR TIME"
          color={Colors.hangColor}
          onPress={handleHangForTimePress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
});
