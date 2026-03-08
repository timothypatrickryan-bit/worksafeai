import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
      {/* Info */}
      <div className="text-sm text-slate-400">
        Showing {startItem} to {endItem} of {total} results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size */}
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {start > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-2 py-1 text-sm text-slate-400 hover:text-white transition-colors"
              >
                1
              </button>
              {start > 2 && <span className="text-slate-500">...</span>}
            </>
          )}

          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                num === page
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {num}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="text-slate-500">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-2 py-1 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
