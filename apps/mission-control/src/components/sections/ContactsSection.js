import React, { useState } from 'react'
import missionControlState from '../../../.mission-control-state.json'

const roleColors = {
  owner: 'border-l-green-400',
  family: 'border-l-pink-400',
  friends: 'border-l-purple-400',
  consultant: 'border-l-blue-400',
  tool: 'border-l-blue-400',
  platform: 'border-l-yellow-400',
}

const roleBadgeColors = {
  owner: 'bg-green-100 text-green-700',
  family: 'bg-pink-100 text-pink-700',
  friends: 'bg-purple-100 text-purple-700',
  consultant: 'bg-gray-100 text-slate-700',
  tool: 'bg-gray-100 text-slate-700',
  platform: 'bg-yellow-100 text-yellow-700',
}

export default function ContactsSection({ state }) {
  const stateData = state || missionControlState
  const contacts = stateData?.contacts || {}
  const [expanded, setExpanded] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    id: '',
    name: '',
    title: '',
    role: 'consultant',
    channels: {},
    timezone: 'America/New_York',
    notes: '',
  })
  const [editingContact, setEditingContact] = useState(null)
  const [newChannel, setNewChannel] = useState({
    type: 'email',
    name: '',
    value: '',
  })

  // Group by role
  const grouped = {}
  Object.entries(contacts).forEach(([key, contact]) => {
    const role = contact.role || 'other'
    if (!grouped[role]) grouped[role] = []
    grouped[role].push([key, contact])
  })

  const roleLabels = {
    owner: '👤 People - Owners',
    family: '❤️ Family',
    friends: '👫 Friends',
    consultant: '🎯 People - Consultants',
    tool: '🤖 AI Tools',
    platform: '⚙️ Platforms & Services',
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddContact = async () => {
    if (!newContact.id || !newContact.name) {
      alert('Contact ID and Name are required')
      return
    }

    try {
      await fetch('http://localhost:3000/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      })

      setNewContact({
        id: '',
        name: '',
        title: '',
        role: 'consultant',
        channels: {},
        timezone: 'America/New_York',
        notes: '',
      })
      setNewChannel({ type: 'email', name: '', value: '' })
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding contact:', err)
      alert('Failed to add contact')
    }
  }

  const handleAddChannel = () => {
    if (!newChannel.name || !newChannel.value) {
      alert('Channel name and value are required')
      return
    }

    const channels = { ...newContact.channels }
    const fieldKey = newChannel.type === 'email' ? 'address' : newChannel.type === 'whatsapp' ? 'phone' : newChannel.type === 'telegram' ? 'id' : newChannel.type

    channels[newChannel.type] = {
      name: newChannel.name,
      [fieldKey]: newChannel.value,
      status: 'active',
    }

    setNewContact({ ...newContact, channels })
    setNewChannel({ type: 'email', name: '', value: '' })
  }

  const removeChannel = (type) => {
    const channels = { ...newContact.channels }
    delete channels[type]
    setNewContact({ ...newContact, channels })
  }

  const startEdit = (contactId) => {
    const contact = contacts[contactId]
    setEditingId(contactId)
    setEditingContact({
      ...contact,
    })
  }

  const handleEditSave = async (contactId) => {
    if (!editingContact.name) {
      alert('Name is required')
      return
    }

    try {
      await fetch('http://localhost:3000/api/contacts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contactId,
          contact: editingContact,
        }),
      })

      setEditingId(null)
      setEditingContact(null)
    } catch (err) {
      console.error('Error updating contact:', err)
      alert('Failed to update contact')
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingContact(null)
  }

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm(`Delete contact "${contacts[contactId].name}"?`)) {
      return
    }

    try {
      await fetch(`http://localhost:3000/api/contacts/delete/${contactId}`, {
        method: 'POST',
      })

      setEditingId(null)
      setEditingContact(null)
    } catch (err) {
      console.error('Error deleting contact:', err)
      alert('Failed to delete contact')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Contact Button/Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-md hover:bg-slate-700 transition-colors"
        >
          + Add New Contact
        </button>
      ) : (
        <div className="bg-gray-100 border border-blue-200 rounded-md p-4 space-y-3">
          {/* Contact Details */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Contact ID *</label>
            <input
              type="text"
              placeholder="unique-id"
              value={newContact.id}
              onChange={(e) => setNewContact({ ...newContact, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Title</label>
              <input
                type="text"
                placeholder="CEO"
                value={newContact.title}
                onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Role</label>
              <select
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="owner">Owner</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="consultant">Consultant</option>
                <option value="tool">AI Tool</option>
                <option value="platform">Platform</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                placeholder="America/New_York"
                value={newContact.timezone}
                onChange={(e) => setNewContact({ ...newContact, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Notes</label>
            <textarea
              placeholder="Optional notes about this contact"
              value={newContact.notes}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 resize-none h-10"
            />
          </div>

          {/* Add Channels */}
          <div className="border-t border-blue-100 pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Add Channels</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={newChannel.type}
                  onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="api">API</option>
                  <option value="web">Web</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Channel name (e.g., 'Gmail')"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder={newChannel.type === 'email' ? 'name@example.com' : newChannel.type === 'telegram' ? '12345678' : newChannel.type === 'whatsapp' ? '+1-XXX-XXX-XXXX' : 'value'}
                value={newChannel.value}
                onChange={(e) => setNewChannel({ ...newChannel, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddChannel}
                className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-sm hover:bg-gray-300 transition-colors"
              >
                Add Channel
              </button>
            </div>

            {/* Show Added Channels */}
            {Object.keys(newContact.channels).length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-600">Channels:</p>
                {Object.entries(newContact.channels).map(([type, channel]) => (
                  <div key={type} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-700">{channel.name} ({type})</span>
                    <button
                      onClick={() => removeChannel(type)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-blue-100">
            <button
              onClick={handleAddContact}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-sm hover:bg-green-700 transition-colors"
            >
              Create Contact
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewContact({
                  id: '',
                  name: '',
                  title: '',
                  role: 'consultant',
                  channels: {},
                  timezone: 'America/New_York',
                  notes: '',
                })
              }}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Contacts */}
      {Object.keys(contacts).length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([role, items]) => (
            <div key={role}>
              <div className="mb-3 flex items-center gap-2 text-gray-600 font-semibold">
                <span>{roleLabels[role] || role}</span>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 ml-2">
                {items.map(([key, contact]) => {
                  const isExpanded = expanded[key]
                  const hasDetails = contact.channels && Object.keys(contact.channels).length > 0

                  return (
                    <div
                      key={key}
                      className={`bg-white border-l-4 ${roleColors[contact.role] || 'border-l-gray-300'} rounded-lg p-4 shadow-sm hover:shadow-md transition-all`}
                    >
                      {editingId === key && editingContact ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Name *</label>
                            <input
                              type="text"
                              value={editingContact.name}
                              onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">Title</label>
                              <input
                                type="text"
                                value={editingContact.title}
                                onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-700">Role</label>
                              <select
                                value={editingContact.role}
                                onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                              >
                                <option value="owner">Owner</option>
                                <option value="family">Family</option>
                                <option value="friends">Friends</option>
                                <option value="consultant">Consultant</option>
                                <option value="tool">AI Tool</option>
                                <option value="platform">Platform</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                            <textarea
                              value={editingContact.notes}
                              onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 resize-none h-12"
                            />
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleEditSave(key)}
                              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-sm hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-sm hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteContact(key)}
                              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-sm hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <button
                            onClick={() => hasDetails && toggleExpand(key)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{contact.name}</div>
                                <div className="text-sm text-gray-500 italic">{contact.title}</div>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${roleBadgeColors[contact.role] || 'bg-gray-100 text-gray-600'}`}>
                                {contact.role}
                              </span>
                            </div>
                          </button>

                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => startEdit(key)}
                              className="flex-1 px-3 py-1.5 bg-gray-100 text-slate-700 text-xs font-semibold rounded-sm hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </>
                      )}

                      {!editingId && hasDetails && isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {/* Channels */}
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Channels:</div>
                            <div className="space-y-2">
                              {Object.entries(contact.channels).map(([chKey, channel]) => {
                                let detail = ''
                                if (channel.phone) detail = channel.phone
                                else if (channel.handle) detail = channel.handle
                                else if (channel.address) detail = channel.address
                                else if (channel.endpoint) detail = channel.endpoint
                                else if (channel.org) detail = `@${channel.org}`
                                else if (channel.account) detail = channel.account
                                else if (channel.project) detail = channel.project
                                else if (channel.id) detail = channel.id

                                return (
                                  <div key={chKey} className="bg-gray-50 p-2 rounded text-sm">
                                    <div className="font-medium text-slate-600">📞 {channel.name}</div>
                                    {detail && <div className="text-gray-600">{detail}</div>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div>⏰ {contact.availability || 'Always'}</div>
                            <div>🌍 {contact.timezone || 'UTC'}</div>
                            {contact.cost_per_use && <div>💰 {contact.cost_per_use}</div>}
                          </div>

                          {/* Notes */}
                          {contact.notes && (
                            <div className="text-sm text-gray-600 italic border-t border-gray-200 pt-2">
                              {contact.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
