import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Colors from "../constants/colors";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import DynamometerActivityScreen from "../screens/DynamometerActivityScreen";
import DynamometerInputScreen from "../screens/DynamometerInputScreen";
import FarmerWalkActivityScreen from "../screens/FarmerWalkActivityScreen";
import FarmerWalkDistanceInputScreen from "../screens/FarmerWalkDistanceInputScreen";
import FarmerWalkScreen from "../screens/FarmerWalkScreen";
import HangActivityScreen from "../screens/HangActivityScreen";
import HangStopwatchScreen from "../screens/HangStopwatchScreen";
import HangTimeInputScreen from "../screens/HangTimeInputScreen";

export type RootStackParamList = {
  Activities: undefined;
  HangActivity: undefined;
  HangTimeInput: undefined;
  HangStopwatch: { targetTime: number };
  FarmerWalkActivity: undefined;
  FarmerWalkDistanceInput: undefined;
  FarmerWalkDistance: {
    targetDistance: number;
    leftHandWeight: number;
    rightHandWeight: number;
  };
  DynamometerActivity: undefined;
  DynamometerInput: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          color: Colors.text,
        },
        headerTintColor: Colors.text,
      }}
    >
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
      <Stack.Screen
        name="HangActivity"
        component={HangActivityScreen}
        options={{ title: "Hang" }}
      />
      <Stack.Screen
        name="HangTimeInput"
        component={HangTimeInputScreen}
        options={{ title: "Set Target Time" }}
      />
      <Stack.Screen
        name="HangStopwatch"
        component={HangStopwatchScreen}
        options={{ title: "Hang Challenge" }}
      />
      <Stack.Screen
        name="FarmerWalkActivity"
        component={FarmerWalkActivityScreen}
        options={{ title: "Farmer Walk" }}
      />
      <Stack.Screen
        name="FarmerWalkDistanceInput"
        component={FarmerWalkDistanceInputScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="FarmerWalkDistance"
        component={FarmerWalkScreen}
        options={{ title: "Farmer Walk Challenge" }}
      />
      <Stack.Screen
        name="DynamometerActivity"
        component={DynamometerActivityScreen}
        options={{ title: "Dynamometer" }}
      />
      <Stack.Screen
        name="DynamometerInput"
        component={DynamometerInputScreen}
        options={{ title: "Grip Strength Test" }}
      />
    </Stack.Navigator>
  );
}
