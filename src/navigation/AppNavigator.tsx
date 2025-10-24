import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";

import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useOnboarding } from "../hooks/useOnboarding";
import DashboardScreen from "../screens/DashboardScreen";
import OnboardingFlow from "../screens/onboarding/OnboardingFlow";
import ProfileScreen from "../screens/ProfileScreen";
import StackNavigator from "./StackNavigator";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const {
    isOnboardingCompleted,
    isLoading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding();

  // Show loading screen while checking auth state or onboarding
  if (isLoading || onboardingLoading) {
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

  // Show onboarding if not completed (this will handle auth automatically)
  if (!isOnboardingCompleted) {
    return (
      <NavigationContainer>
        <OnboardingFlow onComplete={completeOnboarding} />
      </NavigationContainer>
    );
  }

  // Show main app with tabs if signed in and onboarding completed
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
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
          name="Workouts"
          component={StackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fitness" size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Navigate to Activities screen when Workouts tab is pressed
              navigation.navigate("Workouts", { screen: "Activities" });
            },
          })}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
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
