/**
 * Root Navigator
 * Main navigation setup for Mission Control iOS app
 * Tab-based navigation with stack screens
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { Colors, Spacing } from '../theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import BriefingsScreen from '../screens/BriefingsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Dashboard Stack
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={({ route }) => ({
          title: 'Task Details',
          headerShadowVisible: false,
        })}
      />
    </Stack.Navigator>
  );
}

// Briefings Stack
function BriefingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="BriefingsHome"
        component={BriefingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BriefingDetail"
        component={PortfolioScreen}
        options={{
          title: 'Briefing Details',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Portfolio Stack
function PortfolioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="PortfolioHome"
        component={PortfolioScreen}
        options={{
          title: 'Portfolio',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Inbox Stack
function InboxStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="InboxHome"
        component={InboxScreen}
        options={{
          title: 'Inbox',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  const unreadCount = useStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingVertical: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Spacing.xs,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginTop: Spacing.xs,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Briefings"
        component={BriefingsStack}
        options={{
          tabBarLabel: 'Briefings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioStack}
        options={{
          tabBarLabel: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💼</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxStack}
        options={{
          tabBarLabel: `Inbox`,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📩</Text>
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export function RootNavigator() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default RootNavigator;
