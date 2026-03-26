import { useState, useEffect } from 'react';

const TYPE_ICONS = {
  Markdown: '📝',
  PDF: '📄',
  Text: '📃',
  JSON: '📋',
  File: '📁',
};

function SimpleMarkdown({ content }) {
  // Very lightweight markdown rendering for headers, bold, lists, code blocks
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto my-2 font-mono">
            {codeBuffer.join('\n')}
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-slate-800 mt-3 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold text-slate-700 mt-2 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-slate-600 mt-2 mb-1">{line.slice(5)}</h4>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 ml-4 text-sm text-gray-700">
          <span className="text-gray-400">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineMd(line.slice(2)) }} />
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      elements.push(
        <div key={i} className="flex gap-2 ml-4 text-sm text-gray-700">
          <span className="text-gray-500 font-mono">{match[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: inlineMd(match[2]) }} />
        </div>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-3 border-blue-400 pl-3 text-sm text-gray-600 italic my-1">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith('---') || line.startsWith('***')) {
      elements.push(<hr key={i} className="my-3 border-gray-300" />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank" rel="noopener">$1</a>');
}

export default function DocumentViewer({ projectId }) {
  const [documents, setDocuments] = useState([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/documents`);
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();
        setDocuments(data.documents || []);
        setLabel(data.label || '');
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [projectId]);

  const toggleDocument = async (doc) => {
    if (expandedDoc === doc.name) {
      setExpandedDoc(null);
      setDocContent(null);
      return;
    }

    setExpandedDoc(doc.name);
    setContentLoading(true);
    try {
      const res = await fetch(`/api/documents/content?path=${encodeURIComponent(doc.path)}`);
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      setDocContent(data.content);
    } catch (err) {
      setDocContent('Error loading document content.');
    } finally {
      setContentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="text-sm text-gray-500">Loading documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return null; // Don't render section if no documents
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">📂 Documents</h2>
        <span className="text-xs text-gray-500">{label} · {documents.length} file{documents.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <div key={doc.name}>
            <button
              onClick={() => toggleDocument(doc)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
            >
              <span className="text-lg">{TYPE_ICONS[doc.type] || '📁'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{doc.name}</div>
                <div className="text-xs text-gray-500">
                  {doc.type} · {doc.sizeFormatted} · Modified {doc.modifiedFormatted}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {expandedDoc === doc.name ? '▼ Collapse' : '▶ View'}
              </div>
            </button>
            {expandedDoc === doc.name && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="mt-3 max-h-96 overflow-y-auto rounded border border-gray-200 bg-white p-4">
                  {contentLoading ? (
                    <div className="text-sm text-gray-500">Loading content...</div>
                  ) : doc.type === 'Markdown' ? (
                    <SimpleMarkdown content={docContent || ''} />
                  ) : (
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{docContent}</pre>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {doc.relativePath}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
