import { useState, useEffect } from 'react';
import DocumentViewer from '../components/DocumentViewer';

export default function Docs() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docContent, setDocContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const { categories: fetchedCategories, success } = await res.json();
      
      if (!success || !fetchedCategories) {
        setCategories([]);
        setError('No documents found');
        return;
      }

      // Convert object to array if needed
      const catArray = Array.isArray(fetchedCategories) 
        ? fetchedCategories 
        : Object.values(fetchedCategories);
      
      setCategories(catArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocClick = async (doc) => {
    try {
      setLoadingDoc(true);
      const docPath = doc.path || doc.title;
      const res = await fetch(`/api/documents/file/${docPath}`);
      
      if (!res.ok) {
        throw new Error(`Failed to load document: ${res.statusText}`);
      }

      const { doc: docData, success } = await res.json();
      
      if (!success || !docData) {
        throw new Error('No document data received');
      }

      setSelectedDoc(docData);
      setDocContent(docData.content);
      setShowModal(true);
      setError(null);
    } catch (err) {
      console.error('Error loading document:', err);
      alert(`Error loading document: ${err.message}`);
    } finally {
      setLoadingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="text-sm text-gray-500 mt-1">Knowledge base and reference materials</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📚</div>
            <p>Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="text-sm text-gray-500 mt-1">Knowledge base and reference materials</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-900 font-semibold mb-2">Error loading documents</div>
          <div className="text-sm text-red-700 mb-4">{error}</div>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalDocs = categories.reduce((sum, c) => sum + (c.docs ? c.docs.length : 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="text-sm text-gray-500 mt-1">Knowledge base and reference materials</p>
        </div>
        <button className="px-4 py-2 text-sm font-bold bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
          + New Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Documents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Categories</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Last Updated</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">Today</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="bg-gray-50 rounded border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.name} className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {category.docs && category.docs.map((doc) => (
                  <button
                    key={doc.path || doc.title}
                    onClick={() => handleDocClick(doc)}
                    disabled={loadingDoc}
                    className="w-full bg-white rounded border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-50 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900">{doc.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0 ml-4 whitespace-nowrap">
                      {doc.sizeHuman && <div>{doc.sizeHuman}</div>}
                      {doc.modified && <div>{new Date(doc.modified).toLocaleDateString()}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Viewer */}
      {showModal && (
        <DocumentViewer
          doc={selectedDoc}
          content={docContent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
