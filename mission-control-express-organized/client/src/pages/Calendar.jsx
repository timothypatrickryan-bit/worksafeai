const events = [
  { id: 1, title: 'Weekly Planning Session', date: 'Mar 25, 2026', time: '9:00 AM', duration: '1h', type: 'Meeting', status: 'Today' },
  { id: 2, title: 'Deploy WorkSafeAI v2.1', date: 'Mar 26, 2026', time: '2:00 PM', duration: '30m', type: 'Deployment', status: 'Tomorrow' },
  { id: 3, title: 'Client Demo - Elevation AI', date: 'Mar 27, 2026', time: '10:00 AM', duration: '1h', type: 'Meeting', status: 'This Week' },
  { id: 4, title: 'Security Audit Review', date: 'Mar 28, 2026', time: '3:00 PM', duration: '45m', type: 'Review', status: 'This Week' },
  { id: 5, title: 'Sprint Retrospective', date: 'Mar 29, 2026', time: '11:00 AM', duration: '1h', type: 'Meeting', status: 'This Week' },
  { id: 6, title: 'Monthly Progress Report', date: 'Mar 31, 2026', time: '9:00 AM', duration: '2h', type: 'Report', status: 'Next Week' },
];

const typeColors = {
  Meeting: 'bg-blue-100 text-blue-700',
  Deployment: 'bg-purple-100 text-purple-700',
  Review: 'bg-yellow-100 text-yellow-700',
  Report: 'bg-green-100 text-green-700',
};

const statusColors = {
  Today: 'bg-red-100 text-red-700',
  Tomorrow: 'bg-orange-100 text-orange-700',
  'This Week': 'bg-gray-100 text-gray-600',
  'Next Week': 'bg-gray-50 text-gray-500',
};

import { useState } from 'react';

export default function Calendar() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [allEvents, setAllEvents] = useState(events);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', duration: '', type: 'Meeting' });

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      setAllEvents([...allEvents, {
        id: Math.max(...allEvents.map(e => e.id), 0) + 1,
        ...newEvent,
        status: 'Upcoming',
      }]);
      setNewEvent({ title: '', date: '', time: '', duration: '', type: 'Meeting' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">Upcoming events and schedule</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-bold bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Today</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{events.filter(e => e.status === 'Today').length}</div>
          <div className="text-xs text-gray-400 mt-1">events</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Tomorrow</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{events.filter(e => e.status === 'Tomorrow').length}</div>
          <div className="text-xs text-gray-400 mt-1">events</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">This Week</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{events.filter(e => e.status === 'This Week').length}</div>
          <div className="text-xs text-gray-400 mt-1">events</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Upcoming</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{events.length}</div>
          <div className="text-xs text-gray-400 mt-1">events</div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {allEvents.map((event) => (
          <div key={event.id} className="bg-white rounded border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
            <div className="w-14 text-center shrink-0">
              <div className="text-xs text-gray-500 font-semibold">{event.date.split(',')[0].split(' ')[0]}</div>
              <div className="text-2xl font-bold text-slate-900">{event.date.split(' ')[1].replace(',', '')}</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900">{event.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{event.time} · {event.duration}</div>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${typeColors[event.type]}`}>{event.type}</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusColors[event.status]}`}>{event.status}</span>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-900">Add Event</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="e.g., Team Meeting"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                <input
                  type="text"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  placeholder="e.g., Mar 30, 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                <input
                  type="text"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  placeholder="e.g., 2:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                  placeholder="e.g., 1h"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Meeting</option>
                  <option>Deployment</option>
                  <option>Review</option>
                  <option>Report</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
