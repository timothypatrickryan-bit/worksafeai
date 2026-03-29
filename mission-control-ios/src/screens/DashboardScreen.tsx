/**
 * Dashboard Screen
 * Main overview of agents, tasks, and system status
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Text,
  Dimensions,
} from 'react-native';
import { useStore } from '../store';
import { Colors, Typography, Spacing } from '../theme';
import GlassCard from '../components/GlassCard';
import AgentStatusBadge from '../components/AgentStatusBadge';
import TaskCard from '../components/TaskCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type DashboardScreenProps = NativeStackScreenProps<any, 'Dashboard'>;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { tasks, setTasksLoading } = useStore();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTasksLoading(true);
    
    // Simulate network call
    setTimeout(() => {
      setRefreshing(false);
      setTasksLoading(false);
    }, 1000);
  }, []);

  // Mock data for demo
  const agentStats = {
    idle: 2,
    working: 3,
    complete: 15,
  };

  const dailyStats = {
    completionRate: 87,
    valueGenerated: '$4,250',
  };

  // Get next 3 tasks
  const nextTasks = tasks.slice(0, 3);
  const completionRate = tasks.length > 0
    ? Math.round(
        (tasks.filter((t) => t.status === 'complete').length / tasks.length) * 100
      )
    : 0;

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetails', { taskId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mission Control</Text>
          <Text style={styles.headerSubtitle}>Real-time Agent Monitoring</Text>
        </View>

        {/* Agent Status Overview */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Agent Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusCount}>{agentStats.idle}</Text>
              <AgentStatusBadge status="idle" label="Idle" size="small" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusCount}>{agentStats.working}</Text>
              <AgentStatusBadge status="working" label="Working" size="small" />
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusCount}>{agentStats.complete}</Text>
              <AgentStatusBadge status="complete" label="Complete" size="small" />
            </View>
          </View>
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completion Rate</Text>
              <Text style={styles.statValue}>{dailyStats.completionRate}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Value Generated</Text>
              <Text style={styles.statValue}>{dailyStats.valueGenerated}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Execution Status */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Live Execution Status</Text>
          <View style={styles.executionStatus}>
            <View style={styles.statusLine}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusLabel}>All Systems Operational</Text>
            </View>
            <View style={styles.statusLine}>
              <View style={[styles.statusDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statusLabel}>3 Tasks Running</Text>
            </View>
            <View style={styles.statusLine}>
              <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.statusLabel}>Queue Optimal</Text>
            </View>
          </View>
        </GlassCard>

        {/* Task Queue Widget */}
        <View style={styles.taskHeader}>
          <Text style={styles.sectionTitle}>Next 3 Tasks</Text>
          <Text style={styles.queueRate}>{completionRate}% completion</Text>
        </View>

        {nextTasks.length > 0 ? (
          nextTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              progress={task.progress || 0}
              priority={task.priority || 'medium'}
              agentName={task.agentName}
              onPress={() => handleTaskPress(task.id)}
            />
          ))
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tasks available</Text>
          </GlassCard>
        )}

        {/* Navigation Links */}
        <View style={styles.navLinks}>
          <NavLink
            label="📋 View All Tasks"
            onPress={() => navigation.navigate('Tasks')}
          />
          <NavLink
            label="📝 View Briefings"
            onPress={() => navigation.navigate('Briefings')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const NavLink: React.FC<{ label: string; onPress: () => void }> = ({
  label,
  onPress,
}) => (
  <Text style={styles.navLink} onPress={onPress}>
    {label}
  </Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusCount: {
    ...Typography.h2,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  executionStatus: {
    gap: Spacing.md,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: Spacing.radius.full,
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  queueRate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  navLinks: {
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  navLink: {
    ...Typography.label,
    color: Colors.primary,
    padding: Spacing.lg,
    textAlign: 'center',
    backgroundColor: Colors.infoBg,
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
  },
});

export default DashboardScreen;
