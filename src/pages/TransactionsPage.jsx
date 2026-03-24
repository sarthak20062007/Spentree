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
    <div className="flex flex-col" style={{ gap: '40px' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-heading)' }}>Transactions</h1>
        <p className="text-sm opacity-50" style={{ color: 'var(--color-text-muted)' }}>
          {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter & Search Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl py-3 px-4 bg-white/5 border border-white/10 text-white outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all placeholder:text-white/40"
              placeholder="🔍 Search transactions..."
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-xl py-3 px-4 bg-white/5 border border-white/10 text-white outline-none focus:border-[#58a6ff] transition-all min-w-[160px] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-xl py-3 px-4 bg-white/5 border border-white/10 text-white outline-none focus:border-[#58a6ff] transition-all min-w-[140px] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Transaction History Card */}
      {filtered.length > 0 ? (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 animate-slide-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-xs uppercase tracking-widest opacity-40 font-bold text-white">Transaction</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest opacity-40 font-bold text-white">Category</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest opacity-40 font-bold text-white">Date</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest opacity-40 font-bold text-white text-right">Amount</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest opacity-40 font-bold text-white text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all duration-200 min-h-[64px]">
                    <td className="py-5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0 text-lg">
                          {CATEGORY_ICONS[tx.category] || '📦'}
                        </div>
                        <span className="font-bold text-white">{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 whitespace-nowrap text-white/70 text-sm">
                      {tx.category}
                    </td>
                    <td className="py-5 px-4 whitespace-nowrap text-white/50 text-xs">
                      {tx.date}
                    </td>
                    <td className={`py-5 px-4 whitespace-nowrap text-right font-bold text-lg ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-5 px-4 whitespace-nowrap text-center">
                      {deleteConfirm === tx.id ? (
                        <div className="flex items-center justify-center gap-2 animate-fade-in">
                          <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-500/15 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-white/50 hover:text-white/70 font-bold text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(tx.id)}
                          className="text-white/40 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-5 border-t border-white/10 mt-4">
              <span className="text-white/50 text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold border border-white/10 bg-white/5 text-white/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold border border-white/10 bg-white/5 text-white/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center py-20">
          <span className="text-7xl block mb-6">
            {transactions.length === 0 ? '📭' : '🔍'}
          </span>
          <h3 className="text-lg font-semibold mb-3 text-white/80">
            {transactions.length === 0 ? 'No transactions yet' : 'No results found'}
          </h3>
          <p className="text-sm text-white/40">
            {transactions.length === 0
              ? 'Start tracking your expenses and income to see them here.'
              : 'Try adjusting your filters or search term.'}
          </p>
        </div>
      )}

      {/* Summary Footer */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-white font-bold">Showing</p>
            <p className="font-bold text-lg text-white">{filtered.length} tx</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-white font-bold">Total Income</p>
            <p className="font-bold text-lg text-green-500">
              +₹{filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-white font-bold">Total Expenses</p>
            <p className="font-bold text-lg text-red-500">
              -₹{filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
