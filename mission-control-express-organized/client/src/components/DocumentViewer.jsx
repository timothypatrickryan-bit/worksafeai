import { useState, useEffect } from 'react';

export default function DocumentViewer({ doc, content, onClose }) {
  const [copiedText, setCopiedText] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Detect file type
  const isMarkdown = doc?.name?.endsWith('.md');
  const isCode = doc?.name && /\.(js|jsx|ts|tsx|py|java|cpp|c|json|yml|yaml|html|css)$/.test(doc.name);
  const isPlainText = !isMarkdown && !isCode;

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle download
  const handleDownload = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([content || ''], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = doc?.name || 'document.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadError(null);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadError('Failed to download file');
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[85vh] flex flex-col w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{doc?.name || 'Document'}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate">{doc?.path || ''}</p>
            {doc?.sizeHuman && (
              <p className="text-xs text-gray-400 mt-0.5">{doc.sizeHuman}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors text-xl"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {!content ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Loading content...</p>
            </div>
          ) : isMarkdown ? (
            <div className="prose prose-sm max-w-none bg-white p-4 rounded">
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {content}
              </div>
            </div>
          ) : isCode ? (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-xs leading-relaxed font-mono">
              {content}
            </pre>
          ) : (
            <div className="bg-white p-4 rounded text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {content}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCopy}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              copiedText
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {copiedText ? '✓ Copied' : 'Copy All'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download
          </button>
          {downloadError && (
            <span className="text-xs text-red-600 ml-auto">{downloadError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
