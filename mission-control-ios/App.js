import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { networkService } from './src/services/networkService';
import { notificationService } from './src/services/notificationService';
import { syncService } from './src/services/syncService';
import { useStore } from './src/store';

export default function App() {
  useEffect(() => {
    // Initialize services
    networkService.init();
    notificationService.init();
    syncService.startSync();

    // Show notification permission alert (demo)
    console.log('[App] Services initialized');

    // Cleanup on unmount
    return () => {
      networkService.destroy();
      notificationService.destroy();
      syncService.stopSync();
    };
  }, []);

  // For demo purposes, set some test data if user is not authenticated
  useEffect(() => {
    const { user, setUser, projects, setProjects, tasks, setTasks } = useStore.getState();
    
    if (!user && projects.length === 0) {
      // Demo data will be loaded from AsyncStorage if previously saved
      console.log('[App] Ready for user login or cached data');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
