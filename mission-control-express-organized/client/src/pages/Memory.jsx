import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Memory() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memory/latest?count=50');
      if (!res.ok) throw new Error('Failed to fetch memory');
      const { entries: fetchedEntries, success } = await res.json();
      
      if (!success || !fetchedEntries) {
        setEntries([]);
        setError('No memory data available');
        return;
      }

      // Format entries into grouped date format
      const groupedByDate = {};
      fetchedEntries.forEach(entry => {
        const dateKey = entry.date || 'Unknown Date';
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push({
          time: entry.timestamp || '00:00',
          title: entry.title || 'Entry',
          content: entry.text || ''
        });
      });

      // Convert to array and sort by date descending
      const formattedEntries = Object.entries(groupedByDate)
        .map(([date, entryList]) => ({
          date,
          entries: entryList
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setEntries(formattedEntries);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Auto-expand first date
      if (formattedEntries.length > 0) {
        setExpandedDate(formattedEntries[0].date);
      }
    } catch (err) {
      console.error('Error fetching memory:', err);
      setError(err.message || 'Failed to load memory');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Memory</h2>
          <p className="text-sm text-gray-500 mt-1">Daily notes and activity log</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📔</div>
            <p>Loading memory entries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Memory</h2>
          <p className="text-sm text-gray-500 mt-1">Daily notes and activity log</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-900 font-semibold mb-2">Error loading memory</div>
          <div className="text-sm text-red-700 mb-4">{error}</div>
          <button
            onClick={fetchMemory}
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Memory</h2>
          <p className="text-sm text-gray-500 mt-1">Daily notes and activity log</p>
          {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated}</p>}
        </div>
        <button
          onClick={fetchMemory}
          disabled={loading}
          className="px-4 py-2 text-sm font-bold bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Entries</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{entries.reduce((sum, d) => sum + d.entries.length, 0)}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Days Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{entries.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Latest Entry</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{entries.length > 0 ? 'Today' : 'N/A'}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-gray-50 rounded border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No memory entries found</p>
          </div>
        ) : (
          entries.map((day) => (
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
                    <div key={i} className="border-b border-gray-100 last:border-b-0">
                      <button
                        onClick={() => setExpandedEntry(expandedEntry === `${day.date}-${i}` ? null : `${day.date}-${i}`)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 font-mono mb-1">{entry.time}</div>
                          <div className="text-sm font-semibold text-slate-900">{entry.title}</div>
                        </div>
                        <span className="text-gray-400 text-sm shrink-0 ml-2">
                          {expandedEntry === `${day.date}-${i}` ? '▾' : '▸'}
                        </span>
                      </button>
                      {expandedEntry === `${day.date}-${i}` && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="text-sm" {...props} />,
                                code: ({node, inline, ...props}) => 
                                  inline ? 
                                    <code className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono" {...props} /> :
                                    <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono block mb-2 overflow-x-auto" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2" {...props} />,
                                table: ({node, ...props}) => <table className="border-collapse border border-gray-300 text-xs mb-2" {...props} />,
                                th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-bold" {...props} />,
                                td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                              }}
                            >
                              {entry.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
