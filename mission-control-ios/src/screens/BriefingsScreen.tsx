/**
 * Briefings Screen
 * List of active briefings with status overview
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
} from 'react-native';
import { useStore } from '../store';
import { Colors, Typography, Spacing } from '../theme';
import GlassCard from '../components/GlassCard';
import BriefingPreview from '../components/BriefingPreview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type BriefingsScreenProps = NativeStackScreenProps<any, 'Briefings'>;

export const BriefingsScreen: React.FC<BriefingsScreenProps> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'ready' | 'executing' | 'complete'>('all');
  const { briefings, setBriefingsLoading } = useStore();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setBriefingsLoading(true);

    setTimeout(() => {
      setRefreshing(false);
      setBriefingsLoading(false);
    }, 1000);
  }, []);

  // Mock briefings data
  const mockBriefings = [
    {
      id: '1',
      title: 'Q1 Financial Analysis',
      status: 'ready' as const,
      agent: 'Scout',
      content: 'Comprehensive analysis of Q1 revenue streams and market positioning...',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Customer Sentiment Report',
      status: 'executing' as const,
      agent: 'Johnny',
      content: 'Real-time sentiment analysis from customer feedback channels...',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Market Opportunity Assessment',
      status: 'complete' as const,
      agent: 'Velma',
      content: 'Identified 12 emerging market opportunities with implementation plans...',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Risk Mitigation Strategy',
      status: 'draft' as const,
      agent: 'Chief',
      content: 'Draft strategy for mitigating identified operational risks...',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filteredBriefings =
    activeFilter === 'all'
      ? mockBriefings
      : mockBriefings.filter((b) => b.status === activeFilter);

  const briefingStats = {
    total: mockBriefings.length,
    draft: mockBriefings.filter((b) => b.status === 'draft').length,
    ready: mockBriefings.filter((b) => b.status === 'ready').length,
    executing: mockBriefings.filter((b) => b.status === 'executing').length,
    complete: mockBriefings.filter((b) => b.status === 'complete').length,
  };

  const handleBriefingPress = (briefingId: string) => {
    navigation.navigate('BriefingDetail', { briefingId });
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
          <Text style={styles.headerTitle}>Briefings</Text>
          <Text style={styles.headerSubtitle}>Active briefing documents</Text>
        </View>

        {/* Statistics */}
        <GlassCard style={styles.card}>
          <View style={styles.statsGrid}>
            <StatItem label="Total" value={briefingStats.total} />
            <StatItem label="Ready" value={briefingStats.ready} color={Colors.primary} />
            <StatItem label="Executing" value={briefingStats.executing} color={Colors.warning} />
            <StatItem label="Complete" value={briefingStats.complete} color={Colors.success} />
          </View>
        </GlassCard>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <FilterTab
            label="All"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterTab
            label="Draft"
            active={activeFilter === 'draft'}
            onPress={() => setActiveFilter('draft')}
          />
          <FilterTab
            label="Ready"
            active={activeFilter === 'ready'}
            onPress={() => setActiveFilter('ready')}
          />
          <FilterTab
            label="Executing"
            active={activeFilter === 'executing'}
            onPress={() => setActiveFilter('executing')}
          />
        </View>

        {/* Briefing List */}
        <View style={styles.briefingList}>
          {filteredBriefings.length > 0 ? (
            filteredBriefings.map((briefing) => (
              <BriefingPreview
                key={briefing.id}
                id={briefing.id}
                title={briefing.title}
                status={briefing.status}
                agent={briefing.agent}
                content={briefing.content}
                createdAt={briefing.createdAt}
                onPress={() => handleBriefingPress(briefing.id)}
              />
            ))
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No briefings found</Text>
            </GlassCard>
          )}
        </View>

        {/* Create New Briefing CTA */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create New Briefing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const StatItem: React.FC<{
  label: string;
  value: number;
  color?: string;
}> = ({ label, value, color }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statLabel, color && { color }]}>
      {label}
    </Text>
  </View>
);

const FilterTab: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterTab, active && styles.filterTabActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.filterTabText,
        active && styles.filterTabTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.text,
  },
  briefingList: {
    marginBottom: Spacing.lg,
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
  createButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  createButtonText: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
  },
});

export default BriefingsScreen;
