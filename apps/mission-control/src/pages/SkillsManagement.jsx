import React, { useState } from 'react';

const DEFAULT_SKILLS = [
  {
    id: 1,
    name: 'linkedin-post-northeast-dc',
    description: 'Generate Northeast data center market commentary posts',
    category: 'automation',
    status: 'active',
    tags: ['linkedin', 'northeast', 'data-center', 'automation']
  },
  {
    id: 2,
    name: 'recraft-ai',
    description: 'Image generation using Recraft.AI API',
    category: 'media',
    status: 'active',
    tags: ['image', 'generation', 'recraft', 'media']
  },
  {
    id: 3,
    name: 'hyperscaler-daily-update',
    description: 'Daily curated data center and fiber infrastructure news',
    category: 'research',
    status: 'active',
    tags: ['hyperscaler', 'news', 'automation']
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
        ...skillData
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Skills Management</h1>
            <p className="text-purple-200">View, add, edit, and manage Lucy&apos;s capabilities</p>
          </div>
          <button
            onClick={handleAddSkill}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            + Add New Skill
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Skill Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., linkedin-post-generator"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what this skill does"
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="automation">Automation</option>
                      <option value="media">Media</option>
                      <option value="research">Research</option>
                      <option value="analysis">Analysis</option>
                      <option value="integration">Integration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="beta">Beta</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., linkedin, automation, northeast"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSaveSkill}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  Save Skill
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-purple-500/30 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {skills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-purple-200 mb-4">No skills found</p>
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Create Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map(skill => (
              <div
                key={skill.id}
                className="bg-slate-800/50 backdrop-blur border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition group"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                      {skill.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      skill.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      skill.status === 'beta' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {skill.status}
                    </span>
                  </div>
                  <p className="text-sm text-purple-200 mb-3">{skill.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                      {skill.category}
                    </span>
                  </div>

                  {skill.tags && skill.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skill.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSkill(skill)}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-500/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
