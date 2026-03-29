/**
 * Task Details Screen
 * Full task information with execution history and actions
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { Colors, Typography, Spacing } from '../theme';
import GlassCard from '../components/GlassCard';
import AgentStatusBadge from '../components/AgentStatusBadge';
import ProgressIndicator from '../components/ProgressIndicator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type TaskDetailsScreenProps = NativeStackScreenProps<any, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { taskId } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const { tasks, updateTask } = useStore();

  const task = tasks.find((t) => t.id === taskId);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!task) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>Task not found</Text>
      </View>
    );
  }

  const priorityColors = {
    high: Colors.danger,
    medium: Colors.warning,
    low: Colors.textTertiary,
  };

  const handleApprove = () => {
    updateTask(taskId, { status: 'complete' });
    navigation.goBack();
  };

  const handleReject = () => {
    // Mock rejection
    alert('Task rejected');
  };

  const timeSinceCreated = new Date(task.createdAt).toLocaleDateString();
  const history = [
    { status: 'scheduled', time: '2h ago' },
    { status: 'working', time: '1h 30m ago' },
    { status: 'in-review', time: 'now' },
  ];

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
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {task.title}
              </Text>
              <AgentStatusBadge status={task.status} size="medium" />
            </View>
            <Text style={styles.subtitle}>{task.description}</Text>
          </View>
        </View>

        {/* Priority & Task Info */}
        <GlassCard style={styles.card}>
          <View style={styles.infoGrid}>
            <InfoItem
              label="Priority"
              value={task.priority}
              valueColor={priorityColors[task.priority || 'medium']}
            />
            <InfoItem
              label="Agent"
              value={task.agentName || 'Unassigned'}
            />
            <InfoItem
              label="Created"
              value={timeSinceCreated}
            />
          </View>
        </GlassCard>

        {/* Progress */}
        {task.status === 'working' && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={{ marginBottom: Spacing.md }}>
              <ProgressIndicator
                progress={task.progress || 0}
                type="circular"
                size="medium"
                showPercentage={true}
              />
            </View>
          </GlassCard>
        )}

        {/* Execution History */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Execution History</Text>
          <View style={styles.timeline}>
            {history.map((item, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {idx < history.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {item.status.split('-').join(' ').toUpperCase()}
                  </Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Deliverables (if complete) */}
        {task.status === 'complete' && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <View style={styles.deliverables}>
              <DeliverableItem name="Task Report" status="ready" />
              <DeliverableItem name="Execution Logs" status="ready" />
              <DeliverableItem name="Performance Metrics" status="ready" />
            </View>
          </GlassCard>
        )}

        {/* Actions (if awaiting review) */}
        {task.status === 'working' && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={styles.approveButtonText}>✓ Approve & Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.rejectButtonText}>✕ Return to Agent</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Details Section */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <View style={styles.detailsList}>
            <DetailRow label="Task ID" value={task.id} />
            <DetailRow label="Status" value={task.status} />
            <DetailRow label="Priority" value={task.priority} />
            <DetailRow label="Agent" value={task.agentName || 'N/A'} />
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

const DeliverableItem: React.FC<{
  name: string;
  status: 'ready' | 'pending' | 'failed';
}> = ({ name, status }) => (
  <View style={styles.deliverableItem}>
    <Text style={styles.deliverableName}>{name}</Text>
    <Text style={[styles.deliverableStatus, {
      color: status === 'ready' ? Colors.success : Colors.warning,
    }]}>
      {status === 'ready' ? '✓' : '○'} {status.toUpperCase()}
    </Text>
  </View>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  headerContent: {
    gap: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  infoGrid: {
    gap: Spacing.lg,
  },
  infoItem: {
    gap: Spacing.sm,
  },
  infoLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.h5,
    color: Colors.text,
  },
  timeline: {
    gap: Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.primary,
    marginTop: Spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 24,
    bottom: -16,
    width: 1,
    backgroundColor: Colors.border,
  },
  timelineContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  timelineStatus: {
    ...Typography.label,
    color: Colors.text,
  },
  timelineTime: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  deliverables: {
    gap: Spacing.md,
  },
  deliverableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deliverableName: {
    ...Typography.body,
    color: Colors.text,
  },
  deliverableStatus: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  actionSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: Colors.primary,
  },
  approveButtonText: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectButtonText: {
    ...Typography.label,
    color: Colors.danger,
    fontWeight: '600',
  },
  detailsList: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textTertiary,
  },
});

export default TaskDetailsScreen;
