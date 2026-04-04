import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './screens/DashboardScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import TasksScreen from './screens/TasksScreen';
import SettingsScreen from './screens/SettingsScreen';

import { useAuthStore } from './stores/authStore';
import { useInitializeApp } from './hooks/useInitializeApp';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: '#999999',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: '#e0e0e0',
        borderTopWidth: 1,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
      }}
    />
    <Tab.Screen
      name="Projects"
      component={ProjectsScreen}
      options={{
        tabBarLabel: 'Projects',
        tabBarIcon: ({ color }) => <ProjectsIcon color={color} />,
      }}
    />
    <Tab.Screen
      name="Tasks"
      component={TasksScreen}
      options={{
        tabBarLabel: 'Tasks',
        tabBarIcon: ({ color }) => <TasksIcon color={color} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  const isInitialized = useInitializeApp();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isInitialized) {
    return null; // Show splash screen while initializing
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen
              name="MainApp"
              component={DashboardTabs}
            />
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Placeholder icon components
const DashboardIcon = ({ color }) => null;
const ProjectsIcon = ({ color }) => null;
const TasksIcon = ({ color }) => null;
const SettingsIcon = ({ color }) => null;
const AuthScreen = () => null;
