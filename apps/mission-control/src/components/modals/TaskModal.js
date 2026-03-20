import React, { useState, useEffect } from 'react';
import styles from '../styles/Modal.module.css';

/**
 * TaskModal - Unified modal for creating and editing tasks
 * Handles both creation (new task) and editing (existing task)
 */
const TaskModal = ({ 
  isOpen, 
  task = null, // null for create, task object for edit
  projects = [],
  team = [],
  onClose, 
  onSuccess,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 3,
    assignedTo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        priority: task.priority || 3,
        assignedTo: task.assignedTo || null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: '',
        priority: 3,
        assignedTo: null,
      });
    }
    setError(null);
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }
    if (!formData.projectId) {
      setError('Please select a project');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const url = task 
        ? `/api/tasks/${task.id}`
        : '/api/tasks/create';
      
      const method = task ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save task');
      }

      const result = await response.json();
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onDelete?.(task.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!task) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const result = await response.json();
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!task;
  const selectedProject = projects.find(p => p.id === formData.projectId);

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{isEditing ? '✏️ Edit Task' : '➕ Create New Task'}</h2>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorAlert}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title">Task Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Deploy frontend changes"
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task details and requirements..."
                rows="4"
                disabled={loading}
              />
            </div>

            {/* Project */}
            <div className={styles.formGroup}>
              <label htmlFor="projectId">Project *</label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">-- Select a project --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className={styles.formGroup}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="1">🟢 Low</option>
                <option value="2">🟡 Medium</option>
                <option value="3">🟠 High</option>
                <option value="4">🔴 Critical</option>
              </select>
            </div>

            {/* Assigned To */}
            <div className={styles.formGroup}>
              <label htmlFor="assignedTo">Assign To</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  assignedTo: e.target.value || null
                }))}
                disabled={loading}
              >
                <option value="">-- Unassigned --</option>
                {team.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.avatar}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={styles.secondaryButton}
              >
                Cancel
              </button>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={loading}
                    className={styles.statusButton}
                    title={`Current status: ${task?.status || 'queued'}`}
                  >
                    🔄 Cycle Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading || showDeleteConfirm}
                    className={styles.dangerButton}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? '⏳ Saving...' : (isEditing ? '💾 Update Task' : '✅ Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <h3>🗑️ Delete Task?</h3>
            <p>Are you sure you want to delete <strong>{task?.title}</strong>?</p>
            <p className={styles.warningText}>This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className={styles.dangerButton}
              >
                {loading ? '⏳ Deleting...' : '🗑️ Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskModal;
