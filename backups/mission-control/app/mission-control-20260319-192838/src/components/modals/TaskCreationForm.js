import React, { useState, useEffect } from 'react';
import styles from '../styles/TaskCreationForm.module.css';

/**
 * TASK CREATION FORM
 * 
 * Allows users to create new tasks within a project with:
 * - Basic info (title, description, status, priority)
 * - Project assignment (required)
 * - Team member assignment (optional)
 * - Briefing info (optional)
 * 
 * Integrates with UnifiedDashboardSection for state management
 */

const TaskCreationForm = ({ isOpen, onClose, onSuccess, projectId, teamMembers = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'queued',
    priority: 2, // 1 = critical, 2 = high, 3 = medium
    projectId: projectId || '',
    assignedTo: '',
    briefing: {
      context: '',
      executionPlan: {
        timeline: {
          summary: '',
          phases: [],
        },
        deliverables: [],
        milestones: [],
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBriefing, setShowBriefing] = useState(false);

  // Update projectId when it changes
  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({
        ...prev,
        projectId,
      }));
    }
  }, [projectId]);

  // Handle basic field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // Handle briefing field changes
  const handleBriefingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      briefing: {
        ...prev.briefing,
        [field]: value,
      },
    }));
    setError('');
  };

  // Handle execution plan changes
  const handleExecutionPlanChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      briefing: {
        ...prev.briefing,
        executionPlan: {
          ...prev.briefing.executionPlan,
          [field]: value,
        },
      },
    }));
    setError('');
  };

  // Handle timeline changes
  const handleTimelineChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      briefing: {
        ...prev.briefing,
        executionPlan: {
          ...prev.briefing.executionPlan,
          timeline: {
            ...prev.briefing.executionPlan.timeline,
            [field]: value,
          },
        },
      },
    }));
    setError('');
  };

  // Handle array field changes (deliverables, phases)
  const handleArrayFieldChange = (arrayField, index, value) => {
    const fieldPath = arrayField === 'phases' 
      ? ['briefing', 'executionPlan', 'timeline', 'phases']
      : ['briefing', 'executionPlan', arrayField];

    setFormData(prev => {
      if (arrayField === 'phases') {
        return {
          ...prev,
          briefing: {
            ...prev.briefing,
            executionPlan: {
              ...prev.briefing.executionPlan,
              timeline: {
                ...prev.briefing.executionPlan.timeline,
                phases: prev.briefing.executionPlan.timeline.phases.map((item, i) =>
                  i === index ? value : item
                ),
              },
            },
          },
        };
      } else {
        return {
          ...prev,
          briefing: {
            ...prev.briefing,
            executionPlan: {
              ...prev.briefing.executionPlan,
              [arrayField]: prev.briefing.executionPlan[arrayField].map((item, i) =>
                i === index ? value : item
              ),
            },
          },
        };
      }
    });
    setError('');
  };

  // Add new array item
  const handleAddArrayItem = (arrayField) => {
    if (arrayField === 'phases') {
      setFormData(prev => ({
        ...prev,
        briefing: {
          ...prev.briefing,
          executionPlan: {
            ...prev.briefing.executionPlan,
            timeline: {
              ...prev.briefing.executionPlan.timeline,
              phases: [...prev.briefing.executionPlan.timeline.phases, ''],
            },
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        briefing: {
          ...prev.briefing,
          executionPlan: {
            ...prev.briefing.executionPlan,
            [arrayField]: [...prev.briefing.executionPlan[arrayField], ''],
          },
        },
      }));
    }
  };

  // Remove array item
  const handleRemoveArrayItem = (arrayField, index) => {
    if (arrayField === 'phases') {
      setFormData(prev => ({
        ...prev,
        briefing: {
          ...prev.briefing,
          executionPlan: {
            ...prev.briefing.executionPlan,
            timeline: {
              ...prev.briefing.executionPlan.timeline,
              phases: prev.briefing.executionPlan.timeline.phases.filter((_, i) => i !== index),
            },
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        briefing: {
          ...prev.briefing,
          executionPlan: {
            ...prev.briefing.executionPlan,
            [arrayField]: prev.briefing.executionPlan[arrayField].filter((_, i) => i !== index),
          },
        },
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Task description is required');
      return false;
    }
    if (!formData.projectId) {
      setError('Project selection is required');
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
        briefing: showBriefing ? {
          ...formData.briefing,
          executionPlan: {
            ...formData.briefing.executionPlan,
            timeline: {
              ...formData.briefing.executionPlan.timeline,
              phases: formData.briefing.executionPlan.timeline.phases.filter(p => p.trim()),
            },
            deliverables: formData.briefing.executionPlan.deliverables.filter(d => d.trim()),
          },
        } : null,
      };

      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create task');
      }

      const result = await response.json();
      setSuccess('✅ Task created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'queued',
        priority: 2,
        projectId: projectId || '',
        assignedTo: '',
        briefing: {
          context: '',
          executionPlan: {
            timeline: {
              summary: '',
              phases: [],
            },
            deliverables: [],
            milestones: [],
          },
        },
      });
      setShowBriefing(false);

      // Call success callback after a brief delay to show the message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Task creation error:', err);
      setError(err.message || '❌ Error creating task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const priorityLabels = {
    1: '🔴 Critical',
    2: '🟠 High',
    3: '🟡 Medium',
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>📝 Create New Task</h2>
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
            <h3 className={styles.sectionTitle}>📋 Task Information</h3>

            <div className={styles.formGroup}>
              <label htmlFor="title">Task Title *</label>
              <input
                id="title"
                type="text"
                placeholder="Enter task title"
                value={formData.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                placeholder="What needs to be done?"
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={e => handleFieldChange('status', e.target.value)}
                  className={styles.select}
                >
                  <option value="queued">📋 Queued</option>
                  <option value="executing">⚙️ Executing</option>
                  <option value="planned">🎯 Planned</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={e => handleFieldChange('priority', parseInt(e.target.value))}
                  className={styles.select}
                >
                  <option value={1}>🔴 Critical</option>
                  <option value={2}>🟠 High</option>
                  <option value={3}>🟡 Medium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>👥 Assignment</h3>

            <div className={styles.formGroup}>
              <label htmlFor="projectId">Project *</label>
              <input
                id="projectId"
                type="text"
                placeholder="Project ID"
                value={formData.projectId}
                onChange={e => handleFieldChange('projectId', e.target.value)}
                className={styles.input}
                readOnly={projectId ? true : false}
              />
              {projectId && <small style={{ color: '#7a8a99', marginTop: '4px', display: 'block' }}>
                Linked to project: {projectId}
              </small>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="assignedTo">Assigned To (Optional)</label>
              {teamMembers && teamMembers.length > 0 ? (
                <select
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={e => handleFieldChange('assignedTo', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>
                      👤 {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="assignedTo"
                  type="text"
                  placeholder="Team member name"
                  value={formData.assignedTo}
                  onChange={e => handleFieldChange('assignedTo', e.target.value)}
                  className={styles.input}
                />
              )}
            </div>
          </div>

          {/* Optional Briefing Section */}
          <div className={styles.section}>
            <div
              className={styles.briefingToggle}
              onClick={() => setShowBriefing(!showBriefing)}
            >
              <span className={styles.toggleIcon}>{showBriefing ? '▼' : '▶'}</span>
              <h3 className={styles.sectionTitle}>📑 Execution Briefing (Optional)</h3>
            </div>

            {showBriefing && (
              <div className={styles.briefingContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="context">Context / Background</label>
                  <textarea
                    id="context"
                    placeholder="Provide context or background information"
                    value={formData.briefing.context}
                    onChange={e => handleBriefingChange('context', e.target.value)}
                    className={styles.textarea}
                    rows={2}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="timeline">Timeline Summary</label>
                  <input
                    id="timeline"
                    type="text"
                    placeholder="e.g., 1-2 weeks"
                    value={formData.briefing.executionPlan.timeline.summary}
                    onChange={e => handleTimelineChange('summary', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Deliverables</label>
                  <div className={styles.arrayContainer}>
                    {formData.briefing.executionPlan.deliverables.map((deliverable, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <input
                          type="text"
                          placeholder={`Deliverable ${index + 1}`}
                          value={deliverable}
                          onChange={e => handleArrayFieldChange('deliverables', index, e.target.value)}
                          className={styles.input}
                        />
                        {formData.briefing.executionPlan.deliverables.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveArrayItem('deliverables', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => handleAddArrayItem('deliverables')}
                    >
                      + Add Deliverable
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Phases</label>
                  <div className={styles.arrayContainer}>
                    {formData.briefing.executionPlan.timeline.phases.map((phase, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <input
                          type="text"
                          placeholder={`Phase ${index + 1}`}
                          value={phase}
                          onChange={e => handleArrayFieldChange('phases', index, e.target.value)}
                          className={styles.input}
                        />
                        {formData.briefing.executionPlan.timeline.phases.length > 1 && (
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
              </div>
            )}
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
              {loading ? '⏳ Creating...' : '📝 Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationForm;
