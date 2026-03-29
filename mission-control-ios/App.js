import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';
import { useStore } from './src/store';

export default function App() {
  useEffect(() => {
    // Initialize demo data with mock tasks if not already present
    const { tasks, setTasks, briefings, setBriefings } = useStore.getState();
    
    if (tasks.length === 0) {
      // Mock task data for demo
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Quarterly Financial Review',
          description: 'Comprehensive analysis of Q1 2026 financial performance',
          status: 'complete',
          priority: 'high',
          agentName: 'Scout',
          progress: 100,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-2',
          title: 'Market Research Analysis',
          description: 'Deep dive into competitor strategy and market positioning',
          status: 'working',
          priority: 'high',
          agentName: 'Johnny',
          progress: 65,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-3',
          title: 'Customer Sentiment Analysis',
          description: 'Analyze customer feedback from recent campaigns',
          status: 'working',
          priority: 'medium',
          agentName: 'Velma',
          progress: 45,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-4',
          title: 'Risk Assessment Report',
          description: 'Identify and prioritize operational risks',
          status: 'idle',
          priority: 'medium',
          agentName: 'Chief',
          progress: 0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-5',
          title: 'Strategic Planning Document',
          description: 'Develop 2026 strategic roadmap',
          status: 'scheduled',
          priority: 'low',
          agentName: null,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      setTasks(mockTasks);
    }

    if (briefings.length === 0) {
      const mockBriefings = [
        {
          id: 'brief-1',
          title: 'Executive Summary Q1',
          status: 'complete',
          agentName: 'Scout',
        },
        {
          id: 'brief-2',
          title: 'Market Opportunities',
          status: 'ready',
          agentName: 'Johnny',
        },
      ];
      setBriefings(mockBriefings);
    }

    console.log('[App] Mission Control iOS initialized');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
