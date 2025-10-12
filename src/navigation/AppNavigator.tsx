import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";

import Colors from "../constants/colors";
import ChallengesScreen from "../screens/ChallengesScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitle: "SmartGrip",
          headerTitleStyle: {
            color: Colors.text,
          },
          tabBarStyle: {
            backgroundColor: Colors.tabBarBackground,
            borderTopColor: Colors.tabBarBorder,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: Colors.tabBarActiveTint,
          tabBarInactiveTintColor: Colors.tabBarInactiveTint,
        }}
      >
        <Tab.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fitness" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
