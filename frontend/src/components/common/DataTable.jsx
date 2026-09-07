import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download, Filter } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  bulkActions = null,
  onRowClick,
  pageSize = 10,
  emptyMessage = 'No matching records found',
  filters = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});

  // Handle sorting
  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = searchFields.length > 0
          ? searchFields.some(field => {
              const val = field.split('.').reduce((obj, key) => obj?.[key], item);
              return String(val || '').toLowerCase().includes(term);
            })
          : Object.values(item).some(val => 
              typeof val === 'object' 
                ? JSON.stringify(val).toLowerCase().includes(term)
                : String(val || '').toLowerCase().includes(term)
            );

        if (!matchesSearch) return false;
      }

      // 2. Active filters
      for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
        if (filterValue && filterValue !== 'ALL') {
          const itemVal = filterKey.split('.').reduce((obj, key) => obj?.[key], item);
          if (String(itemVal) !== String(filterValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, searchFields, activeFilters]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = sortField.split('.').reduce((obj, key) => obj?.[key], a);
      const bVal = sortField.split('.').reduce((obj, key) => obj?.[key], b);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal || '').toLowerCase();
      const strB = String(bVal || '').toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Selection handlers
  const allCurrentPageSelected = paginatedData.length > 0 && paginatedData.every(item => selectedRows.includes(item[keyField]));

  const handleToggleSelectAll = () => {
    if (onSelectAll) {
      if (allCurrentPageSelected) {
        onSelectAll([]);
      } else {
        const pageIds = paginatedData.map(d => d[keyField]);
        const newSelected = Array.from(new Set([...selectedRows, ...pageIds]));
        onSelectAll(newSelected);
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-1 items-center gap-2">
          {searchable && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Optional Filter Dropdowns */}
          {filters.map(filter => (
            <select
              key={filter.key}
              value={activeFilters[filter.key] || 'ALL'}
              onChange={(e) => {
                setActiveFilters(prev => ({ ...prev, [filter.key]: e.target.value }));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing <strong>{Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}</strong> - <strong>{Math.min(sortedData.length, currentPage * pageSize)}</strong> of <strong>{sortedData.length}</strong></span>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectable && selectedRows.length > 0 && bulkActions && (
        <div className="flex items-center justify-between bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 text-sm">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-tiny text-white font-bold">
              {selectedRows.length}
            </span>
            <span>selected records</span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={handleToggleSelectAll}
                    className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-800' : ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  style={{ width: col.width }}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <ArrowUpDown className={`size-3.5 ${sortField === col.key ? 'text-emerald-600' : 'text-slate-400'}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const isSelected = selectedRows.includes(item[keyField]);
                return (
                  <tr
                    key={item[keyField] || idx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${
                      isSelected ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(item[keyField])}
                          className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    {columns.map(col => {
                      const val = col.key.split('.').reduce((obj, key) => obj?.[key], item);
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 whitespace-nowrap text-sm ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(val, item) : String(val ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`size-7 rounded-lg text-xs font-medium ${
                      currentPage === p 
                        ? 'bg-emerald-600 text-white' 
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
