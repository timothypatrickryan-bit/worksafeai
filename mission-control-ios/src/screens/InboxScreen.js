import React, { useState, useCallback, useFocusEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store';
import { syncService } from '../services/syncService';

const InboxScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    messages,
    messagesLoading,
  } = useStore();

  useFocusEffect(
    useCallback(() => {
      syncService.syncMessages();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncService.syncMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.messageCard,
        !item.read && styles.messageUnread,
      ]}
      onPress={() => {
        // TODO: Navigate to message detail
      }}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>{item.from}</Text>
        <Text style={styles.messageTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
      <Text style={styles.messageSubject} numberOfLines={1}>
        {item.subject || 'No subject'}
      </Text>
      <Text
        style={[styles.messageBody, !item.read && styles.messageBodyBold]}
        numberOfLines={2}
      >
        {item.body}
      </Text>
      {item.type === 'briefing' && (
        <View style={styles.briefingBadge}>
          <Text style={styles.briefingBadgeText}>📋 Briefing</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {messagesLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
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
              <Text style={styles.emptyText}>No messages</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// Helper to format time
const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;

  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 12,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageUnread: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#2563eb',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  messageSubject: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  messageBody: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  messageBodyBold: {
    fontWeight: '500',
    color: '#1f2937',
  },
  briefingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  briefingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default InboxScreen;
