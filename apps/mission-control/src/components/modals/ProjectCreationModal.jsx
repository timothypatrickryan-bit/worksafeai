import React, { useState } from 'react';
import styles from '../styles/ProjectCreationModal.module.css';

/**
 * PROJECT CREATION MODAL
 * 
 * Allows users to create new projects with:
 * - Basic info (name, description, status)
 * - Orchestrator plan (objective, phases, timeline, metrics)
 * 
 * Integrates with UnifiedDashboardSection for state management
 */

const ProjectCreationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    orchestratorPlan: {
      objective: '',
      phases: [''],
      timeline: '',
      metrics: [''],
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle basic field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // Handle orchestrator plan field changes
  const handlePlanFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      orchestratorPlan: {
        ...prev.orchestratorPlan,
        [field]: value,
      },
    }));
    setError('');
  };

  // Handle array field changes (phases, metrics)
  const handleArrayFieldChange = (arrayField, index, value) => {
    setFormData(prev => ({
      ...prev,
      orchestratorPlan: {
        ...prev.orchestratorPlan,
        [arrayField]: prev.orchestratorPlan[arrayField].map((item, i) =>
          i === index ? value : item
        ),
      },
    }));
    setError('');
  };

  // Add new array item
  const handleAddArrayItem = (arrayField) => {
    setFormData(prev => ({
      ...prev,
      orchestratorPlan: {
        ...prev.orchestratorPlan,
        [arrayField]: [...prev.orchestratorPlan[arrayField], ''],
      },
    }));
  };

  // Remove array item
  const handleRemoveArrayItem = (arrayField, index) => {
    setFormData(prev => ({
      ...prev,
      orchestratorPlan: {
        ...prev.orchestratorPlan,
        [arrayField]: prev.orchestratorPlan[arrayField].filter((_, i) => i !== index),
      },
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return false;
    }
    if (!formData.orchestratorPlan.objective.trim()) {
      setError('Strategic objective is required');
      return false;
    }
    if (!formData.orchestratorPlan.timeline.trim()) {
      setError('Timeline is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        orchestratorPlan: {
          ...formData.orchestratorPlan,
          phases: formData.orchestratorPlan.phases.filter(p => p.trim()),
          metrics: formData.orchestratorPlan.metrics.filter(m => m.trim()),
        },
      };

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create project');
      }

      const result = await response.json();
      setSuccess('✅ Project created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'active',
        orchestratorPlan: {
          objective: '',
          phases: [''],
          timeline: '',
          metrics: [''],
        },
      });

      // Call success callback after a brief delay to show the message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.message || '❌ Error creating project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>🚀 Create New Project</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Info Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 Basic Information</h3>

            <div className={styles.formGroup}>
              <label htmlFor="name">Project Name *</label>
              <input
                id="name"
                type="text"
                placeholder="Enter project name"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                placeholder="What is this project about?"
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                value={formData.status}
                onChange={e => handleFieldChange('status', e.target.value)}
                className={styles.select}
              >
                <option value="active">✨ Active</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orchestrator Plan Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Strategic Plan (Orchestrator)</h3>

            <div className={styles.formGroup}>
              <label htmlFor="objective">Strategic Objective *</label>
              <textarea
                id="objective"
                placeholder="What is the primary goal of this project?"
                value={formData.orchestratorPlan.objective}
                onChange={e => handlePlanFieldChange('objective', e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>

            {/* Phases */}
            <div className={styles.formGroup}>
              <label>Phases (Key milestones)</label>
              <div className={styles.arrayContainer}>
                {formData.orchestratorPlan.phases.map((phase, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <input
                      type="text"
                      placeholder={`Phase ${index + 1}`}
                      value={phase}
                      onChange={e => handleArrayFieldChange('phases', index, e.target.value)}
                      className={styles.input}
                    />
                    {formData.orchestratorPlan.phases.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveArrayItem('phases', index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => handleAddArrayItem('phases')}
                >
                  + Add Phase
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="timeline">Timeline *</label>
              <input
                id="timeline"
                type="text"
                placeholder="e.g., 3 months, 8-12 weeks"
                value={formData.orchestratorPlan.timeline}
                onChange={e => handlePlanFieldChange('timeline', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Metrics */}
            <div className={styles.formGroup}>
              <label>Success Metrics</label>
              <div className={styles.arrayContainer}>
                {formData.orchestratorPlan.metrics.map((metric, index) => (
                  <div key={index} className={styles.arrayItem}>
                    <input
                      type="text"
                      placeholder={`Metric ${index + 1}`}
                      value={metric}
                      onChange={e => handleArrayFieldChange('metrics', index, e.target.value)}
                      className={styles.input}
                    />
                    {formData.orchestratorPlan.metrics.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveArrayItem('metrics', index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => handleAddArrayItem('metrics')}
                >
                  + Add Metric
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '🚀 Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
