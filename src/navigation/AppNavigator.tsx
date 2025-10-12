import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";

import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import AuthScreen from "../screens/AuthScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <NavigationContainer>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.text, fontSize: 18 }}>
            Loading your data
          </Text>
        </View>
      </NavigationContainer>
    );
  }

  // Show auth screen if not signed in
  if (!user) {
    return (
      <NavigationContainer>
        <AuthScreen />
      </NavigationContainer>
    );
  }

  // Show main app with tabs if signed in
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
