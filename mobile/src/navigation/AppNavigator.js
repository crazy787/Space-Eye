import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS, FONT_SIZES } from '../styles/theme';

// Phase 1 Screens
import HomeScreen from '../screens/HomeScreen';
import ISSTrackerScreen from '../screens/ISSTrackerScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ExploreScreen from '../screens/ExploreScreen';

// Phase 2 Screens
import SpaceViewScreen from '../screens/SpaceViewScreen';
import ISSTourScreen from '../screens/ISSTourScreen';
import RocketSimScreen from '../screens/RocketSimScreen';

// Phase 3 Screens
import SatelliteTrackerScreen from '../screens/SatelliteTrackerScreen';
import TelescopeScreen from '../screens/TelescopeScreen';
import SpaceMediaScreen from '../screens/SpaceMediaScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabIcons = {
  Home: { focused: 'planet', unfocused: 'planet-outline' },
  Tracker: { focused: 'navigate', unfocused: 'navigate-outline' },
  AI: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Alerts: { focused: 'notifications', unfocused: 'notifications-outline' },
  Explore: { focused: 'telescope', unfocused: 'telescope-outline' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused
            ? tabIcons[route.name]?.focused
            : tabIcons[route.name]?.unfocused;
          return (
            <View style={focused ? styles.activeIconContainer : null}>
              <Ionicons name={iconName} size={focused ? 24 : 22} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tracker" component={ISSTrackerScreen} options={{ title: 'ISS Track' }} />
      <Tab.Screen name="AI" component={AIAssistantScreen} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.bgPrimary,
          card: COLORS.bgSecondary,
          text: COLORS.textPrimary,
          border: COLORS.surfaceBorder,
          notification: COLORS.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Main App */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Phase 2 */}
        <Stack.Screen name="SpaceView" component={SpaceViewScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="ISSTour" component={ISSTourScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="RocketSim" component={RocketSimScreen} options={{ animation: 'slide_from_bottom' }} />

        {/* Phase 3 */}
        <Stack.Screen name="SatelliteTracker" component={SatelliteTrackerScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Telescope" component={TelescopeScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="SpaceMedia" component={SpaceMediaScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgSecondary,
    borderTopColor: COLORS.surfaceBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  activeIconContainer: {
    alignItems: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
});
