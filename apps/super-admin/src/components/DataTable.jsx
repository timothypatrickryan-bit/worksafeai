import { ChevronUp, ChevronDown, Trash2, Edit2 } from 'lucide-react';

/**
 * Reusable DataTable Component
 * @param {Array} data - Table data
 * @param {Array} columns - Column config [{ key, label, render?, sortable?, width? }]
 * @param {string} sortBy - Current sort column
 * @param {string} sortOrder - Sort order: 'asc' | 'desc'
 * @param {Function} onSort - Sort handler
 * @param {Function} onEdit - Edit handler (row) - optional
 * @param {Function} onDelete - Delete handler (row) - optional. Caller should handle confirmation (modal/alert).
 * @param {boolean} loading - Loading state
 * @param {string} emptyMessage - Empty state message
 */
export default function DataTable({
  data = [],
  columns = [],
  sortBy = null,
  sortOrder = 'asc',
  onSort = () => {},
  onEdit = null,
  onDelete = null,
  loading = false,
  emptyMessage = 'No data found',
}) {
  const handleSort = (key) => {
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column.key) return null;
    return sortOrder === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg overflow-hidden animate-pulse">
        <div className="space-y-2 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-sm font-semibold text-slate-200 ${
                      column.sortable ? 'cursor-pointer hover:bg-slate-600' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                    aria-sort={
                      sortBy === column.key
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    style={column.width ? { width: column.width } : {}}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && <SortIcon column={column} />}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-200">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-slate-700 transition-colors">
                  {columns.map((column) => (
                    <td key={`${row.id || rowIdx}-${column.key}`} className="px-6 py-4">
                      <div className="text-slate-200">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </div>
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-colors"
                            title="Edit"
                            aria-label={`Edit row`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 hover:bg-slate-600 rounded-lg text-red-400 transition-colors"
                            title="Delete"
                            aria-label={`Delete row`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-slate-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
