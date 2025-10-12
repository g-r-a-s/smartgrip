import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ActivitiesScreen from "../screens/ActivitiesScreen";
import HangActivityScreen from "../screens/HangActivityScreen";
import HangStopwatchScreen from "../screens/HangStopwatchScreen";
import HangTimeInputScreen from "../screens/HangTimeInputScreen";

export type RootStackParamList = {
  Activities: undefined;
  HangActivity: undefined;
  HangTimeInput: undefined;
  HangStopwatch: { targetTime: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#000",
        },
        headerTitleStyle: {
          color: "#fff",
        },
        headerTintColor: "#fff",
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
    </Stack.Navigator>
  );
}
