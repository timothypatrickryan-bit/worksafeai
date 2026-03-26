import React, { useState, useEffect } from 'react';
import styles from '../styles/Modal.module.css';

/**
 * ProjectModal - Unified modal for creating and editing projects
 */
const ProjectModal = ({ 
  isOpen, 
  project = null, // null for create, project object for edit
  onClose, 
  onSuccess,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
      });
    }
    setError(null);
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters');
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
      const url = project 
        ? `/api/projects/${project.id}`
        : '/api/projects/create';
      
      const method = project ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save project');
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
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      onDelete?.(project.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!project;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{isEditing ? '✏️ Edit Project' : '➕ Create New Project'}</h2>
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorAlert}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name">Project Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Q2 Safety Initiative"
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
                placeholder="Project overview and objectives..."
                rows="4"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="active">🟢 Active</option>
                <option value="inactive">⚪ Inactive</option>
                <option value="completed">✅ Completed</option>
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
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || showDeleteConfirm}
                  className={styles.dangerButton}
                >
                  🗑️ Delete
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? '⏳ Saving...' : (isEditing ? '💾 Update Project' : '✅ Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <h3>🗑️ Delete Project?</h3>
            <p>Are you sure you want to delete <strong>{project?.name}</strong>?</p>
            <p className={styles.warningText}>
              All associated tasks will be marked as orphaned. This action cannot be undone.
            </p>
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
                {loading ? '⏳ Deleting...' : '🗑️ Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectModal;
