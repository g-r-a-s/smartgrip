import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import Colors from "../constants/colors";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import AttiaChallengeScreen from "../screens/AttiaChallengeScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import DynamometerInputScreen from "../screens/DynamometerInputScreen";
import FarmerWalkDistanceInputScreen from "../screens/FarmerWalkDistanceInputScreen";
import FarmerWalkScreen from "../screens/FarmerWalkScreen";
import HangReadyScreen from "../screens/HangReadyScreen";
import HangStopwatchScreen from "../screens/HangStopwatchScreen";
import HangTimeInputScreen from "../screens/HangTimeInputScreen";
import TrainingGroundScreen from "../screens/TrainingGroundScreen";

export type RootStackParamList = {
  Activities: undefined;
  AttiaChallenge: { challengeType?: "hang" | "farmer-walk" };
  Challenges: undefined;
  TrainingGround: undefined;
  HangTimeInput: undefined;
  HangReady: { targetSeconds: number };
  HangStopwatch: { targetTime: number };
  FarmerWalkDistanceInput: undefined;
  FarmerWalkDistance: {
    targetDistance: number;
    leftHandWeight: number;
    rightHandWeight: number;
  };
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
        name="AttiaChallenge"
        component={AttiaChallengeScreen}
        options={{ title: "Attia Challenge" }}
      />
      <Stack.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{ title: "Challenges" }}
      />
      <Stack.Screen
        name="TrainingGround"
        component={TrainingGroundScreen}
        options={{ title: "Training Ground" }}
      />
      <Stack.Screen
        name="HangTimeInput"
        component={HangTimeInputScreen}
        options={{ title: "Set Target Time" }}
      />
      <Stack.Screen
        name="HangReady"
        component={HangReadyScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="HangStopwatch"
        component={HangStopwatchScreen}
        options={{ title: "Hang Challenge" }}
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
        name="DynamometerInput"
        component={DynamometerInputScreen}
        options={{ title: "Dynamometer" }}
      />
    </Stack.Navigator>
  );
}
