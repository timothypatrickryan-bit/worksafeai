import { useState } from 'react';

const contacts = [
  { id: 1, name: 'Tim Ryan', email: 'tim@elevationaiwork.com', role: 'Founder / Operator', company: 'Elevation AI', phone: '—', tags: ['Primary', 'Admin'] },
  { id: 2, name: 'Lucy (AI Agent)', email: 'lucy@elevationaiagents.com', role: 'Lead AI Agent', company: 'Elevation AI', phone: '—', tags: ['Agent'] },
  { id: 3, name: 'Support Team', email: 'support@elevationaiwork.com', role: 'Customer Support', company: 'Elevation AI', phone: '—', tags: ['Team'] },
  { id: 4, name: 'Client Services', email: 'clients@elevationaiwork.com', role: 'Account Management', company: 'Elevation AI', phone: '—', tags: ['Team'] },
];

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', role: '', company: '', tags: '' });
  const [allContacts, setAllContacts] = useState(contacts);

  const filtered = allContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      setAllContacts([...allContacts, {
        id: Math.max(...allContacts.map(c => c.id), 0) + 1,
        ...newContact,
        tags: newContact.tags ? newContact.tags.split(',').map(t => t.trim()) : [],
      }]);
      setNewContact({ name: '', email: '', role: '', company: '', tags: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contacts</h2>
          <p className="text-sm text-gray-500 mt-1">Contact information and directory</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-bold bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
        >
          + Add Contact
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Company</div>
          <div>Tags</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No contacts found</div>
        ) : (
          filtered.map((contact) => (
            <div key={contact.id} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
              <div className="text-sm font-bold text-slate-900">{contact.name}</div>
              <div className="text-sm text-blue-600">{contact.email}</div>
              <div className="text-sm text-gray-600">{contact.role}</div>
              <div className="text-sm text-gray-600">{contact.company}</div>
              <div className="flex gap-1 flex-wrap">
                {contact.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600">{tag}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-900">Add Contact</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={newContact.role}
                  onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                  placeholder="e.g., Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newContact.tags}
                  onChange={(e) => setNewContact({...newContact, tags: e.target.value})}
                  placeholder="e.g., Team, Admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
