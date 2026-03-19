import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useStore } from '../store';
import { syncService } from '../services/syncService';

const BriefingModal = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState(null);

  const { showBriefingModal, toggleBriefingModal, briefings } = useStore();

  const currentBriefing = briefings.find((b) => !b.approved && !b.rejected);

  const handleApprove = async (briefingId, approved) => {
    setLoading(true);
    try {
      await syncService.approveBriefing(briefingId, approved);
      Alert.alert(
        'Success',
        approved ? 'Briefing approved!' : 'Briefing rejected'
      );
      toggleBriefingModal(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process briefing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={showBriefingModal}
      transparent
      animationType="fade"
      onRequestClose={() => toggleBriefingModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📋 Briefing Request</Text>
            <TouchableOpacity
              onPress={() => toggleBriefingModal(false)}
              disabled={loading}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {currentBriefing ? (
              <>
                <View style={styles.briefingCard}>
                  <Text style={styles.briefingTitle}>
                    {currentBriefing.title}
                  </Text>
                  <Text style={styles.briefingDescription}>
                    {currentBriefing.description}
                  </Text>

                  {currentBriefing.details && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsTitle}>Details</Text>
                      <Text style={styles.detailsText}>
                        {currentBriefing.details}
                      </Text>
                    </View>
                  )}

                  {currentBriefing.attachments && (
                    <View style={styles.attachmentsSection}>
                      <Text style={styles.attachmentsTitle}>Attachments</Text>
                      {currentBriefing.attachments.map((att, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.attachmentItem}
                        >
                          <Text style={styles.attachmentText}>
                            📎 {att.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No pending briefings
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          {currentBriefing && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() =>
                  handleApprove(currentBriefing.id, false)
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#dc2626" size="small" />
                ) : (
                  <Text style={styles.rejectButtonText}>Reject</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() =>
                  handleApprove(currentBriefing.id, true)
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.approveButtonText}>Approve</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#9ca3af',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  briefingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  briefingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  briefingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  attachmentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachmentsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  attachmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 6,
  },
  attachmentText: {
    fontSize: 13,
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  approveButton: {
    backgroundColor: '#2563eb',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BriefingModal;
