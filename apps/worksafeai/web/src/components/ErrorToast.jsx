import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function useErrorToast() {
  const [errors, setErrors] = useState([]);

  const addError = (message, id = Date.now()) => {
    setErrors((prev) => [...prev, { id, message }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== id));
    }, 5000);
  };

  const removeError = (id) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  };

  return { errors, addError, removeError };
}

export function ErrorToastContainer({ errors, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-4"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
          <button
            onClick={() => onRemove(error.id)}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
