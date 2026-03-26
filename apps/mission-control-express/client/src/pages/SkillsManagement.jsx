import React, { useState } from 'react';
import styles from './SkillsManagement.module.css';

const DEFAULT_SKILLS = [
  {
    id: 1,
    name: 'linkedin-post-northeast-dc',
    description: 'Generate Northeast data center market commentary posts',
    category: 'automation',
    status: 'active',
    tags: ['linkedin', 'northeast', 'data-center', 'automation'],
  },
  {
    id: 2,
    name: 'recraft-ai',
    description: 'Image generation using Recraft.AI API',
    category: 'media',
    status: 'active',
    tags: ['image', 'generation', 'recraft', 'media'],
  },
  {
    id: 3,
    name: 'hyperscaler-daily-update',
    description: 'Daily curated data center and fiber infrastructure news',
    category: 'research',
    status: 'active',
    tags: ['hyperscaler', 'news', 'automation'],
  }
];

export default function SkillsManagement() {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'automation',
    status: 'active',
    tags: ''
  });

  const handleAddSkill = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      description: '',
      category: 'automation',
      status: 'active',
      tags: ''
    });
    setShowForm(true);
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      status: skill.status,
      tags: skill.tags.join(', ')
    });
    setShowForm(true);
  };

  const handleSaveSkill = () => {
    const skillData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    if (editingSkill) {
      const updated = skills.map(s => s.id === editingSkill.id ? { ...editingSkill, ...skillData } : s);
      setSkills(updated);
    } else {
      const newSkill = {
        id: Math.max(...skills.map(s => s.id), 0) + 1,
        ...skillData,
      };
      setSkills([...skills, newSkill]);
    }

    setShowForm(false);
  };

  const handleDeleteSkill = (skillId) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      setSkills(skills.filter(s => s.id !== skillId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'beta': return 'blue';
      case 'inactive': return 'gray';
      case 'archived': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>My Skills</h1>
          <p>View, add, edit, and manage your capabilities</p>
        </div>
        <button className={styles.addButton} onClick={handleAddSkill}>
          + Add New Skill
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>

            <div className={styles.formGroup}>
              <label>Skill Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., linkedin-post-generator"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this skill does"
                rows="3"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="automation">Automation</option>
                  <option value="media">Media</option>
                  <option value="research">Research</option>
                  <option value="analysis">Analysis</option>
                  <option value="integration">Integration</option>
                  <option value="security">Security</option>
                  <option value="development">Development</option>
                  <option value="data">Data</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="beta">Beta</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., linkedin, automation, northeast"
              />
            </div>

            <div className={styles.formActions}>
              <button className={styles.saveButton} onClick={handleSaveSkill}>
                Save Skill
              </button>
              <button className={styles.cancelButton} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.skillsGrid}>
        {skills.length === 0 ? (
          <div className={styles.empty}>
            <p>No skills installed yet</p>
            <button onClick={handleAddSkill}>+ Add New Skill</button>
          </div>
        ) : (
          skills.map(skill => (
            <div key={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                <h3>{skill.name}</h3>
                <span className={`${styles.badge} ${styles[`badge-${getStatusColor(skill.status)}`]}`}>
                  {skill.status}
                </span>
              </div>

              <p className={styles.description}>{skill.description}</p>

              <div className={styles.meta}>
                <span className={styles.category}>{skill.category}</span>
              </div>

              {skill.tags && skill.tags.length > 0 && (
                <div className={styles.tags}>
                  {skill.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditSkill(skill)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteSkill(skill.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
