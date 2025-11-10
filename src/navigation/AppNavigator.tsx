import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
import HangReadyScreen from "../screens/HangReadyScreen";
import HangStopwatchScreen from "../screens/HangStopwatchScreen";
import HangTimeInputScreen from "../screens/HangTimeInputScreen";
import OnboardingFlow from "../screens/onboarding/OnboardingFlow";
import ProfileScreen from "../screens/ProfileScreen";
import TrainingGroundScreen from "../screens/TrainingGroundScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "speedometer-outline",
  Challenges: "trophy-outline",
  Training: "barbell-outline",
  Profile: "person-outline",
};

const tabStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bar: {
    backgroundColor: Colors.tabBarGlassBackground,
    borderRadius: 50,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: Colors.tabBarGlassBorder,
    height: 82,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#11141d",
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: 260,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: Colors.accentOrange,
    borderWidth: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.accentOrange,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  iconContainerInactive: {
    // borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.28)",
    // backgroundColor: "transparent",
  },
});

const GlassTabBar = ({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) => {
  return (
    <View
      style={[
        tabStyles.container,
        { paddingBottom: Math.max(insets.bottom, 18) },
      ]}
    >
      <View style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const descriptor = descriptors[route.key];
          const iconName = TAB_ICONS[route.name] ?? "ellipse-outline";

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={tabStyles.tabButton}
              activeOpacity={0.8}
            >
              <View
                style={[
                  tabStyles.iconContainer,
                  isFocused
                    ? tabStyles.iconContainerActive
                    : tabStyles.iconContainerInactive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={isFocused ? 24 : 22}
                  color={
                    isFocused
                      ? Colors.tabBarGlassBackground
                      : "rgba(255, 255, 255, 0.85)"
                  }
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Training" component={TrainingGroundScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const stackHeaderStyles = StyleSheet.create({
  backButton: {
    backgroundColor: Colors.white,
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});

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
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontFamily: "Lufga-Bold",
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
          options={({ navigation }) => ({
            title: "Attia Challenge",
            headerTransparent: true,
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontFamily: "Lufga-Bold",
              color: Colors.white,
              fontSize: 16,
            },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={stackHeaderStyles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={26} color={Colors.black} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="HangTimeInput"
          component={HangTimeInputScreen}
          options={({ navigation }) => ({
            title: "Set Target Time",
            headerTransparent: true,
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontFamily: "Lufga-Bold",
              color: Colors.white,
              fontSize: 16,
            },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={stackHeaderStyles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={26} color={Colors.black} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="HangReady"
          component={HangReadyScreen}
          options={({ navigation }) => ({
            title: "",
            headerTransparent: true,
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontFamily: "Lufga-Bold",
              color: Colors.white,
              fontSize: 16,
            },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={stackHeaderStyles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={26} color={Colors.black} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="HangStopwatch"
          component={HangStopwatchScreen}
          options={({ navigation }) => ({
            title: "",
            headerTransparent: true,
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontFamily: "Lufga-Bold",
              color: Colors.white,
              fontSize: 16,
            },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={stackHeaderStyles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={26} color={Colors.black} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="FarmerWalkDistanceInput"
          component={FarmerWalkDistanceInputScreen}
          options={({ navigation }) => ({
            title: "Set Challenge",
            headerTransparent: true,
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontFamily: "Lufga-Bold",
              color: Colors.white,
              fontSize: 16,
            },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={stackHeaderStyles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={26} color={Colors.black} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="FarmerWalkDistance"
          component={FarmerWalkScreen}
          options={{ title: "Farmer Walk" }}
        />
        <Stack.Screen
          name="DynamometerInput"
          component={DynamometerInputScreen}
          options={{
            title: "Dynamometer",
            headerTitleStyle: { fontFamily: "Lufga-Bold" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
