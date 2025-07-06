import { useState, useMemo } from 'react';

function TableMaster({
  columns = [],
  data = [],
  keyField,
  renderRow,
  pagination = false,
  pageSize = 10,
  sortable = false,
  defaultSortKey = null,
  defaultSortDir = 'asc',
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortable || !sortKey) return [...data];
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'string') {
        return sortDir === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortDir, sortable]);

  const pagedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(data.length / pageSize);

  const sortIndicator = (key) => {
    if (!sortable || key == null) return null;
    if (sortKey === key) return sortDir === 'asc' ? ' ↑' : ' ↓';
    return '';
  };

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`p-2 border cursor-pointer select-none ${
                  col.thClassName || ''
                }`}
                onClick={() =>
                  sortable && col.sortable !== false && handleSort(col.key)
                }
              >
                <div className="flex items-center justify-center gap-1">
                  {col.label}
                  {sortable && col.sortable !== false && sortIndicator(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((item) => (
            <tr
              key={item[keyField]}
              className="text-center"
            >
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TableMaster;
