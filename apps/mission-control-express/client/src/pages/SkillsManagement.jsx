import React, { useState, useEffect } from 'react';
import styles from './SkillsManagement.module.css';

const DEFAULT_SKILLS = [
  {
    id: 1,
    name: 'linkedin-post-northeast-dc',
    description: 'Generate Northeast data center market commentary posts',
    category: 'automation',
    status: 'active',
    tags: ['linkedin', 'northeast', 'data-center', 'automation'],
    installed: true
  },
  {
    id: 2,
    name: 'recraft-ai',
    description: 'Image generation using Recraft.AI API',
    category: 'media',
    status: 'active',
    tags: ['image', 'generation', 'recraft', 'media'],
    installed: true
  },
  {
    id: 3,
    name: 'hyperscaler-daily-update',
    description: 'Daily curated data center and fiber infrastructure news',
    category: 'research',
    status: 'active',
    tags: ['hyperscaler', 'news', 'automation'],
    installed: true
  }
];

// Sample Clawhub marketplace skills
const CLAWHUB_MARKETPLACE = [
  {
    id: 'healthcheck',
    name: 'healthcheck',
    description: 'Host security hardening and risk-tolerance configuration for OpenClaw deployments',
    category: 'security',
    rating: 4.8,
    downloads: 2541,
    homepage: 'https://clawhub.com/skills/healthcheck',
    tags: ['security', 'hardening', 'audit'],
    author: 'OpenClaw Team'
  },
  {
    id: 'node-connect',
    name: 'node-connect',
    description: 'Diagnose OpenClaw node connection and pairing failures for Android, iOS, and macOS',
    category: 'integration',
    rating: 4.6,
    downloads: 1823,
    homepage: 'https://clawhub.com/skills/node-connect',
    tags: ['troubleshooting', 'networking', 'mobile'],
    author: 'OpenClaw Team'
  },
  {
    id: 'weather',
    name: 'weather',
    description: 'Get current weather and forecasts via wttr.in or Open-Meteo',
    category: 'data',
    rating: 4.9,
    downloads: 5234,
    homepage: 'https://clawhub.com/skills/weather',
    tags: ['weather', 'forecasts', 'open-data'],
    author: 'OpenClaw Community'
  },
  {
    id: 'skill-creator',
    name: 'skill-creator',
    description: 'Create, edit, improve, or audit AgentSkills with full spec compliance',
    category: 'development',
    rating: 4.7,
    downloads: 892,
    homepage: 'https://clawhub.com/skills/skill-creator',
    tags: ['skills', 'development', 'automation'],
    author: 'OpenClaw Team'
  },
  {
    id: 'github-automation',
    name: 'github-automation',
    description: 'Automate GitHub workflows, PRs, and repository management',
    category: 'integration',
    rating: 4.5,
    downloads: 1456,
    homepage: 'https://clawhub.com/skills/github-automation',
    tags: ['github', 'automation', 'devops'],
    author: 'Community Contributors'
  },
  {
    id: 'slack-integration',
    name: 'slack-integration',
    description: 'Send messages, manage channels, and automate Slack workflows',
    category: 'integration',
    rating: 4.4,
    downloads: 1876,
    homepage: 'https://clawhub.com/skills/slack-integration',
    tags: ['slack', 'messaging', 'automation'],
    author: 'Community Contributors'
  }
];

export default function SkillsManagement() {
  const [activeTab, setActiveTab] = useState('my-skills');
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [marketplaceSkills, setMarketplaceSkills] = useState(CLAWHUB_MARKETPLACE);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
        installed: false
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

  const handleInstallSkill = (marketplaceSkill) => {
    // Check if already installed
    if (skills.find(s => s.name === marketplaceSkill.name)) {
      alert('This skill is already installed');
      return;
    }

    // Install the skill
    const newSkill = {
      id: Math.max(...skills.map(s => typeof s.id === 'number' ? s.id : 0), 0) + 1,
      name: marketplaceSkill.name,
      description: marketplaceSkill.description,
      category: marketplaceSkill.category,
      status: 'active',
      tags: marketplaceSkill.tags,
      installed: true,
      homepage: marketplaceSkill.homepage
    };

    setSkills([...skills, newSkill]);
    alert(`✅ ${marketplaceSkill.name} installed successfully!`);
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

  const filteredMarketplace = marketplaceSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const notInstalled = !skills.find(s => s.name === skill.name);
    return matchesSearch && matchesCategory && notInstalled;
  });

  const categories = ['all', ...new Set(marketplaceSkills.map(s => s.category))];

  return (
    <div className={styles.container}>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tab} ${activeTab === 'my-skills' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('my-skills')}
        >
          📚 My Skills ({skills.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'discover' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          🔍 Discover Clawhub
        </button>
      </div>

      {/* MY SKILLS TAB */}
      {activeTab === 'my-skills' && (
        <>
          <div className={styles.header}>
            <div>
              <h1>My Skills</h1>
              <p>View, add, edit, and manage your installed capabilities</p>
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
                    {skill.installed && <span className={styles.installedBadge}>✓ Installed</span>}
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
        </>
      )}

      {/* DISCOVER TAB */}
      {activeTab === 'discover' && (
        <>
          <div className={styles.header}>
            <div>
              <h1>Discover Skills</h1>
              <p>Browse and install skills from Clawhub marketplace</p>
            </div>
          </div>

          <div className={styles.discoverControls}>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.skillsGrid}>
            {filteredMarketplace.length === 0 ? (
              <div className={styles.empty}>
                <p>No skills found matching your search</p>
              </div>
            ) : (
              filteredMarketplace.map(skill => (
                <div key={skill.id} className={styles.marketplaceCard}>
                  <div className={styles.skillHeader}>
                    <div>
                      <h3>{skill.name}</h3>
                      <p className={styles.author}>by {skill.author}</p>
                    </div>
                    <span className={styles.categoryTag}>{skill.category}</span>
                  </div>

                  <p className={styles.description}>{skill.description}</p>

                  <div className={styles.stats}>
                    <span className={styles.rating}>
                      ⭐ {skill.rating} ({skill.downloads.toLocaleString()} installs)
                    </span>
                  </div>

                  {skill.tags && skill.tags.length > 0 && (
                    <div className={styles.tags}>
                      {skill.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button
                      className={styles.installButton}
                      onClick={() => handleInstallSkill(skill)}
                    >
                      ⬇️ Install
                    </button>
                    <a
                      href={skill.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.learnMoreLink}
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
