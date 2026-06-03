'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getCategoryIcon } from '@/lib/utils';

const categories = [
  { id: 'dining', label: 'Dining', icon: 'restaurant' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
  { id: 'transport', label: 'Transport', icon: 'directions_car' },
  { id: 'housing', label: 'Housing', icon: 'home' },
  { id: 'leisure', label: 'Leisure', icon: 'confirmation_number' },
  { id: 'health', label: 'Health', icon: 'medical_services' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'other', label: 'Other', icon: 'category' },
];

const incomeCategories = [
  { id: 'salary', label: 'Salary', icon: 'payments' },
  { id: 'freelance', label: 'Freelance', icon: 'work' },
  { id: 'investment', label: 'Investment', icon: 'trending_up' },
  { id: 'other', label: 'Other', icon: 'category' },
];

const availableTags = ['Personal', 'Essential', 'Recurring', 'Business', 'Impulse', 'Planned'];

export default function LogPage() {
  const { addTransaction, transactions, budgets, totalBalance, deleteTransaction } = useStore();

  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);

  const recentTxs = showAllTx ? transactions : transactions.slice(0, 5);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (!selectedCategory) return;

    addTransaction({
      amount: val,
      type: txType,
      category: selectedCategory,
      merchant,
      date,
      tags: selectedTags,
    });

    // Reset form
    setAmount('');
    setSelectedCategory('');
    setMerchant('');
    setSelectedTags([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentCats = txType === 'expense' ? categories : incomeCategories;

  // Daily budget calculation
  const totalBudgetLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyBudget = Math.round(totalBudgetLimit / daysInMonth);
  const todaySpent = transactions
    .filter(t => t.type === 'expense' && t.date === new Date().toISOString().split('T')[0])
    .reduce((s, t) => s + t.amount, 0);
  const dailyRemaining = Math.max(0, dailyBudget - todaySpent);
  const dailyPct = dailyBudget > 0 ? Math.round((todaySpent / dailyBudget) * 100) : 0;

  return (
    <>
      <Navbar />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-secondary text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">Transaction logged! +XP earned 🎮</span>
        </div>
      )}

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Form Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Type Toggle */}
          <div className="flex bg-surface-container-low p-1 rounded-xl w-fit">
            <button
              onClick={() => { setTxType('expense'); setSelectedCategory(''); }}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${txType === 'expense' ? 'bg-error text-white shadow-sm' : 'text-on-surface-variant'}`}
            >
              💸 Expense
            </button>
            <button
              onClick={() => { setTxType('income'); setSelectedCategory(''); }}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${txType === 'income' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`}
            >
              💰 Income
            </button>
          </div>

          {/* Amount Header */}
          <div className="bg-surface-container-lowest p-10 rounded-xl text-center space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] text-outline font-bold">
              {txType === 'expense' ? 'Amount Spent' : 'Amount Received'}
            </label>
            <div className="relative flex items-center justify-center">
              <span className="text-4xl font-headline font-bold text-primary mr-2 opacity-40">₹</span>
              <input
                className="w-full max-w-md text-center text-7xl font-headline font-extrabold text-primary bg-transparent border-none focus:ring-0 p-0 focus:outline-none"
                placeholder="0"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setAmount(val);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
              <h3 className="font-headline font-bold text-lg text-primary">Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentCats.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl transition-all border active:scale-95 ${
                      selectedCategory === cat.id
                        ? 'bg-primary-fixed border-primary/30 shadow-sm'
                        : 'bg-surface-container-lowest border-transparent hover:bg-primary-fixed/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl mb-2 text-primary">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-low p-8 rounded-xl space-y-4">
                <h3 className="font-headline font-bold text-lg text-primary">Transaction Details</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-outline uppercase tracking-wider">
                      {txType === 'expense' ? 'Merchant / Note' : 'Source / Note'}
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 h-12 px-4 text-sm"
                      placeholder={txType === 'expense' ? 'e.g. Swiggy, Amazon' : 'e.g. Company Name'}
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-outline uppercase tracking-wider">Date</label>
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 h-12 px-4 text-sm"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-8 rounded-xl space-y-4">
                <h3 className="font-headline font-bold text-lg text-primary">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full cursor-pointer transition-colors flex items-center gap-1 ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-fixed text-on-primary-fixed-variant'
                          : 'bg-surface-container-highest text-on-surface-variant hover:bg-secondary-container'
                      }`}
                    >
                      {tag}
                      <span className="material-symbols-outlined text-sm">
                        {selectedTags.includes(tag) ? 'close' : 'add'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={!amount || !selectedCategory || parseFloat(amount) <= 0}
            className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-lg shadow-[0_20px_40px_rgba(0,53,39,0.15)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {txType === 'expense' ? 'Execute Transaction' : 'Record Income'}
          </button>
        </div>

        {/* Sidebar Activity Section */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low p-8 rounded-xl sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-xl text-primary">Recent Activity</h3>
              <button onClick={() => setShowAllTx(!showAllTx)} className="text-xs font-bold text-emerald-700 hover:underline uppercase tracking-widest">
                {showAllTx ? 'Show Less' : 'See All'}
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentTxs.length === 0 ? (
                <div className="text-center py-8 text-outline text-sm">
                  <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">receipt_long</span>
                  No transactions yet
                </div>
              ) : (
                recentTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors">
                        <span className="material-symbols-outlined text-lg">{getCategoryIcon(tx.category)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{tx.merchant || tx.category}</p>
                        <p className="text-xs text-outline">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-headline font-bold text-sm ${tx.type === 'income' ? 'text-secondary' : 'text-error'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-error/60 hover:text-error"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Daily Budget */}
            <div className="mt-8 pt-8 border-t border-outline-variant/20">
              <p className="text-xs font-semibold text-outline uppercase tracking-widest mb-4">Daily Budget Remaining</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-headline font-extrabold text-primary">{formatCurrency(dailyRemaining)}</span>
                <span className="text-xs font-bold text-outline mb-1.5">of {formatCurrency(dailyBudget)}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${dailyPct > 90 ? 'bg-error' : 'bg-primary'}`}
                  style={{ width: `${Math.min(dailyPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="relative bg-primary-container p-8 rounded-xl overflow-hidden">
            <div className="relative z-10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed">Current Balance</p>
              <p className="font-headline font-bold text-white text-3xl">{formatCurrency(totalBalance)}</p>
              <p className="text-primary-fixed text-sm">{transactions.length} total transactions logged</p>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
