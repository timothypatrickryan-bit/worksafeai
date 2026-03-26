import { useState } from 'react';

const memoryEntries = [
  {
    date: 'March 25, 2026',
    entries: [
      { time: '7:18 PM', content: 'Mission Control Express app rebuilt with React + Vite + Express. All 7 pages implemented.' },
      { time: '3:45 PM', content: 'Deployed WorkSafeAI v2.1 to production. All tests passing.' },
      { time: '10:20 AM', content: 'Weekly planning session completed. Q2 priorities set: scalability improvements and new client onboarding.' },
    ],
  },
  {
    date: 'March 24, 2026',
    entries: [
      { time: '6:30 PM', content: 'Gap analysis assessment completed. Overall score: 87/100. Scalability flagged as primary improvement area.' },
      { time: '2:15 PM', content: 'LinkedIn post drafted and published about AI agent workflows. 47 impressions in first hour.' },
      { time: '9:00 AM', content: 'Morning check-in: 3 unread emails, calendar clear until afternoon.' },
    ],
  },
  {
    date: 'March 23, 2026',
    entries: [
      { time: '5:00 PM', content: 'Security audit completed on all Vercel deployments. No critical issues found.' },
      { time: '11:30 AM', content: 'Refactored Consensus app authentication flow. Reduced login time by 40%.' },
    ],
  },
  {
    date: 'March 22, 2026',
    entries: [
      { time: '4:45 PM', content: 'New client inquiry from website contact form. Drafted response for Tim\'s review.' },
      { time: '1:00 PM', content: 'Updated MEMORY.md with Q1 retrospective insights.' },
    ],
  },
];

export default function Memory() {
  const [expandedDate, setExpandedDate] = useState(memoryEntries[0]?.date);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Memory</h2>
        <p className="text-sm text-gray-500 mt-1">Daily notes and activity log</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Entries</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{memoryEntries.reduce((sum, d) => sum + d.entries.length, 0)}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Days Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{memoryEntries.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Latest Entry</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">Today</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {memoryEntries.map((day) => (
          <div key={day.date} className="bg-white rounded border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">📔 {day.date}</span>
                <span className="text-xs text-gray-500">{day.entries.length} entries</span>
              </div>
              <span className="text-gray-400 text-sm">{expandedDate === day.date ? '▾' : '▸'}</span>
            </button>
            {expandedDate === day.date && (
              <div className="divide-y divide-gray-100">
                {day.entries.map((entry, i) => (
                  <div key={i} className="px-4 py-3 flex gap-4">
                    <div className="text-xs text-gray-400 font-mono w-16 shrink-0 pt-0.5">{entry.time}</div>
                    <div className="text-sm text-gray-700">{entry.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
