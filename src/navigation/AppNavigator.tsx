import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import Colors from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useOnboarding } from "../hooks/useOnboarding";
import { usePaywall } from "../hooks/usePaywall";
import AttiaChallengeScreen from "../screens/AttiaChallengeScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DynamometerInputScreen from "../screens/DynamometerInputScreen";
import FarmerWalkDistanceInputScreen from "../screens/FarmerWalkDistanceInputScreen";
import FarmerWalkScreen from "../screens/FarmerWalkScreen";
import HangStopwatchScreen from "../screens/HangStopwatchScreen";
import HangTimeInputScreen from "../screens/HangTimeInputScreen";
import OnboardingFlow from "../screens/onboarding/OnboardingFlow";
import ProfileScreen from "../screens/ProfileScreen";
import TrainingGroundScreen from "../screens/TrainingGroundScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
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
        name="Challenges"
        component={ChallengesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingGroundScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
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
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const {
    isOnboardingCompleted,
    isLoading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding();
  const { checkAndShowPaywall, isChecking } = usePaywall();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  // Check subscription status and show paywall
  useEffect(() => {
    const verifyAccess = async () => {
      if (isOnboardingCompleted && !isLoading && hasSubscription === null) {
        const hasSub = await checkAndShowPaywall();
        setHasSubscription(hasSub);
      }
    };
    verifyAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboardingCompleted, isLoading]);

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
        <OnboardingFlow
          onComplete={async (data) => {
            await completeOnboarding(data);
            // Paywall will be shown automatically by useEffect when isOnboardingCompleted becomes true
          }}
        />
      </NavigationContainer>
    );
  }

  // Block access to app if user doesn't have subscription (hard paywall)

  // Show main app with tabs if signed in and onboarding completed
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.black,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AttiaChallenge"
          component={AttiaChallengeScreen}
          options={{ title: "Attia Challenge" }}
        />
        <Stack.Screen
          name="HangTimeInput"
          component={HangTimeInputScreen}
          options={{ title: "Hang for Time" }}
        />
        <Stack.Screen
          name="HangStopwatch"
          component={HangStopwatchScreen}
          options={{ title: "Hang Session" }}
        />
        <Stack.Screen
          name="FarmerWalkDistanceInput"
          component={FarmerWalkDistanceInputScreen}
          options={{ title: "Walk for Distance" }}
        />
        <Stack.Screen
          name="FarmerWalkDistance"
          component={FarmerWalkScreen}
          options={{ title: "Farmer Walk" }}
        />
        <Stack.Screen
          name="DynamometerInput"
          component={DynamometerInputScreen}
          options={{ title: "Dynamometer" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
