import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/gamification';

export default function AddTransactionPage() {
  const { addTransaction } = useApp();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!amount || isNaN(amount) || Number(amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addTransaction({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      type,
    });
    setSubmitted(true);
    setTimeout(() => {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>Add Transaction</h1>
        <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>Log your income or expense and earn +5 points!</p>
      </div>

      <div className="card-static !p-8 md:!p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
        {/* Success Banner */}
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 flex items-center justify-between animate-slide-in">
            <div className="flex items-center gap-3">
              <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
              <p className="font-body text-green-700 dark:text-green-300 font-medium">Transaction successfully saved!</p>
            </div>
            <span className="font-bold text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm text-sm border border-green-100 dark:border-green-800">+5 points</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="mb-2">
            <label className="block font-label mb-3" style={{ color: 'var(--color-text-secondary)' }}>Transaction Type</label>
            <div className="flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="font-body font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">📉 Expense</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === 'income'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="font-body font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">📈 Income</span>
              </label>
            </div>
          </div>


          {/* Title */}
          <div>
            <label className="block font-label mb-2" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`input-field ${errors.title ? '!border-red-500' : ''}`}
              placeholder={type === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Groceries, Rent'}
            />
            {errors.title && <p className="font-label text-red-400 mt-2">{errors.title}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block font-label mb-2" style={{ color: 'var(--color-text-secondary)' }}>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`input-field ${errors.amount ? '!border-red-500' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="font-label text-red-400 mt-2">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block font-label mb-2" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field appearance-none cursor-pointer pr-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="" disabled>Select a category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-label mb-2" style={{ color: 'var(--color-text-secondary)' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`input-field ${errors.date ? '!border-red-500' : ''}`}
            />
            {errors.date && <p className="font-label text-red-400 mt-2">{errors.date}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full !py-4 font-body !font-bold mt-4"
          >
            <span className="flex items-center justify-center gap-2">
              Save {type === 'income' ? 'Income' : 'Expense'}
            </span>
          </button>
        </form>

        {/* Points reward hint */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 font-label text-slate-500 dark:text-slate-400">
          <span className="text-amber-500 text-base">🪙</span>
          <span>Earn <strong className="text-amber-500 dark:text-amber-400 font-bold">+5 points</strong> for every logged transaction</span>
        </div>
      </div>
    </div>
  );
}
