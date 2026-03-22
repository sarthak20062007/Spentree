import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '../utils/gamification';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterCategory !== 'All' && tx.category !== filterCategory) return false;
      if (filterType !== 'All' && tx.type !== filterType.toLowerCase()) return false;
      if (search && !tx.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, search, filterCategory, filterType]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterType]);

  const handleDelete = (id) => {
    deleteTransaction(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>Transactions</h1>
        <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="card-static !p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              placeholder="🔍 Search transactions..."
            />
          </div>
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="input-field !w-auto min-w-[160px]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="input-field !w-auto min-w-[140px]"
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Transaction list */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#1c2128] rounded-xl shadow-sm border border-slate-200 dark:border-[#30363d] animate-slide-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#161b22]/50 border-b border-slate-200 dark:border-[#30363d]">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Transaction</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Category</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400 text-right">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-[#30363d] last:border-0 hover:bg-blue-50/50 dark:hover:bg-[#161b22]/50 transition-colors h-[60px] even:bg-slate-50/50 dark:even:bg-[#161b22]/30">
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] shadow-sm shrink-0 text-lg">
                          {CATEGORY_ICONS[tx.category] || '📦'}
                        </div>
                        <span className="font-body font-bold text-slate-800 dark:text-white">{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 whitespace-nowrap font-body text-slate-600 dark:text-slate-300">
                      {tx.category}
                    </td>
                    <td className="py-3 px-6 whitespace-nowrap font-label text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </td>
                    <td className={`py-3 px-6 whitespace-nowrap text-right font-body font-bold text-lg ${tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-500 dark:text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-6 whitespace-nowrap text-center">
                      {deleteConfirm === tx.id ? (
                        <div className="flex items-center justify-center gap-2 animate-fade-in">
                           <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-[#f85149]/20 px-3 py-1.5 rounded-lg transition-colors">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-slate-500 hover:text-slate-700 font-bold text-sm bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] px-3 py-1.5 rounded-lg transition-colors">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(tx.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Transaction"
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]/20 rounded-b-xl">
              <span className="font-label text-slate-500 dark:text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-label border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#21262d] transition-colors shadow-sm"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-label border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#21262d] transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card-static text-center py-20">
          <span className="text-7xl block mb-6">
            {transactions.length === 0 ? '📭' : '🔍'}
          </span>
          <h3 className="font-card-title mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            {transactions.length === 0 ? 'No transactions yet' : 'No results found'}
          </h3>
          <p className="font-body" style={{ color: 'var(--color-text-faint)' }}>
            {transactions.length === 0
              ? 'Start tracking your expenses and income to see them here.'
              : 'Try adjusting your filters or search term.'}
          </p>
        </div>
      )}

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div className="card-static !p-6 flex flex-wrap gap-8 justify-center font-body">
          <div className="text-center">
            <p className="font-label" style={{ color: 'var(--color-text-muted)' }}>Showing</p>
            <p className="font-bold text-lg mt-1" style={{ color: 'var(--color-text-heading)' }}>{filtered.length} tx</p>
          </div>
          <div className="text-center">
            <p className="font-label" style={{ color: 'var(--color-text-muted)' }}>Total Income</p>
            <p className="font-bold text-lg text-green-500 mt-1">
              +₹{filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="font-label" style={{ color: 'var(--color-text-muted)' }}>Total Expenses</p>
            <p className="font-bold text-lg text-red-500 mt-1">
              -₹{filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
