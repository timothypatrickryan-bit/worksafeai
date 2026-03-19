import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useStore } from '../store';
import { syncService } from '../services/syncService';

const TaskCreationSheet = ({ visible }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const { toggleTaskCreationSheet, activeProject, isOnline } = useStore();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      await syncService.createTask({
        title,
        description,
        priority,
        projectId: activeProject?.id,
        status: 'backlog',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      toggleTaskCreationSheet(false);

      Alert.alert('Success', 'Task created' + (isOnline ? '' : ' (offline)'));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => toggleTaskCreationSheet(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => toggleTaskCreationSheet(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Task</Text>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading || !title.trim()}
            >
              <Text
                style={[
                  styles.createButton,
                  (!title.trim() || loading) && styles.createButtonDisabled,
                ]}
              >
                {loading ? '...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Task description (optional)"
                value={description}
                onChangeText={setDescription}
                editable={!loading}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && styles.priorityButtonActive,
                    ]}
                    onPress={() => setPriority(p)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        priority === p && styles.priorityButtonTextActive,
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!isOnline && (
              <View style={styles.offlineWarning}>
                <Text style={styles.offlineWarningText}>
                  📱 You're offline. This task will be queued and synced when online.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  createButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  createButtonDisabled: {
    color: '#d1d5db',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  offlineWarning: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  offlineWarningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});

export default TaskCreationSheet;
