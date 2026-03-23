import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/gamification';

const inputStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  padding: '14px 16px',
  fontSize: '15px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '6px',
  display: 'block',
};

const focusHandler = (e) => {
  e.target.style.borderColor = '#58a6ff';
  e.target.style.boxShadow = '0 0 8px rgba(88,166,255,0.25)';
};
const blurHandler = (e) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
  e.target.style.boxShadow = 'none';
};

export default function AddTransactionPage() {
  const { addTransaction } = useApp();
  const navigate = useNavigate();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showCoin, setShowCoin] = useState(false);

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
    setShowCoin(true);
    setTimeout(() => setShowCoin(false), 1200);
    setTimeout(() => {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full"
        style={{ maxWidth: '600px' }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>Add Transaction</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>
            Log your income or expense and earn +5 points!
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>

          {/* Floating coin animation */}
          <AnimatePresence>
            {showCoin && (
              <motion.div
                initial={{ opacity: 1, y: 0, x: '-50%' }}
                animate={{ opacity: 0, y: -80 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ position: 'absolute', top: '40%', left: '50%', fontSize: '32px', zIndex: 20, pointerEvents: 'none' }}
              >
                🪙
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(63, 185, 80, 0.15)',
                  border: '1px solid rgba(63, 185, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '18px' }}>✅</span>
                  <span style={{ color: '#3fb950', fontWeight: 600, fontSize: '14px' }}>Transaction saved!</span>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  style={{
                    color: '#3fb950',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(63, 185, 80, 0.1)',
                    border: '1px solid rgba(63, 185, 80, 0.2)',
                  }}
                >
                  +5 pts 🪙
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* Type Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Transaction Type</label>
              <div className="flex gap-2" style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: type === 'income' ? '#3fb950' : 'rgba(255,255,255,0.08)',
                    color: type === 'income' ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  📈 Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: type === 'expense' ? '#f85149' : 'rgba(255,255,255,0.08)',
                    color: type === 'expense' ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  📉 Expense
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.title ? '#f85149' : 'rgba(255,255,255,0.1)' }}
                placeholder={type === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Groceries, Rent'}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
              {errors.title && <p style={{ color: '#f85149', fontSize: '12px', marginTop: '6px' }}>{errors.title}</p>}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: type === 'income' ? '#3fb950' : '#f85149',
                  fontSize: '18px',
                  fontWeight: 700,
                }}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: '40px',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: type === 'income' ? '#3fb950' : '#f85149',
                    borderColor: errors.amount ? '#f85149' : 'rgba(255,255,255,0.1)',
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                />
              </div>
              {errors.amount && <p style={{ color: '#f85149', fontSize: '12px', marginTop: '6px' }}>{errors.amount}</p>}
            </div>

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  paddingRight: '40px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238b949e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              >
                <option value="" disabled>Select a category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_ICONS[cat] || ''} {cat}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.date ? '#f85149' : 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
              {errors.date && <p style={{ color: '#f85149', fontSize: '12px', marginTop: '6px' }}>{errors.date}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '50px',
                background: 'linear-gradient(135deg, #1e3a5f, #7c3aed)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.15)'; }}
              onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
            >
              Save {type === 'income' ? 'Income' : 'Expense'}
            </button>
          </form>

          {/* Points hint */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            <span style={{ fontSize: '16px' }}>🪙</span>
            <span>Earn <strong style={{ color: '#d29922', fontWeight: 700 }}>+5 points</strong> for every logged transaction</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
