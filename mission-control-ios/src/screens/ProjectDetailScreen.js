import React, { useState, useCallback, useFocusEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { syncService } from '../services/syncService';
import TaskCreationSheet from '../components/TaskCreationSheet';
import BriefingModal from '../components/BriefingModal';

const ProjectDetailScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('backlog'); // 'backlog', 'in-progress', 'review', 'done'
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    tasks,
    tasksLoading,
    activeProject,
    showTaskCreationSheet,
    toggleTaskCreationSheet,
  } = useStore();

  useFocusEffect(
    useCallback(() => {
      syncService.syncTasks();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncService.syncTasks();
    } finally {
      setRefreshing(false);
    }
  };

  const filterTasks = () => {
    return tasks.filter((t) => t.status === activeTab);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        // TODO: Navigate to task detail
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <View
          style={[
            styles.priorityBadge,
            styles[`priority${item.priority}`],
          ]}
        >
          <Text style={styles.priorityText}>
            {item.priority || 'medium'}
          </Text>
        </View>
        {item.assignee && (
          <Text style={styles.assignee}>{item.assignee}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredTasks = filterTasks();

  return (
    <View style={styles.container}>
      {/* Kanban Tabs */}
      <View style={styles.tabContainer}>
        {['backlog', 'in-progress', 'review', 'done'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks */}
      {tasksLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                No tasks in {activeTab}
              </Text>
            </View>
          }
        />
      )}

      {/* Create Task Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => toggleTaskCreationSheet(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Task Creation Sheet */}
      <TaskCreationSheet visible={showTaskCreationSheet} />

      {/* Briefing Modal */}
      <BriefingModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  listContent: {
    padding: 12,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityhigh: {
    backgroundColor: '#fee2e2',
  },
  prioritymedium: {
    backgroundColor: '#fef3c7',
  },
  prioritylow: {
    backgroundColor: '#dbeafe',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  assignee: {
    fontSize: 12,
    color: '#6b7280',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
});

export default ProjectDetailScreen;
