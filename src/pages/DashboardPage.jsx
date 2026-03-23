import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

import { calculateLevel, getLevelProgress, getNextLevel, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/gamification';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AnimatedNumber({ value, duration = 1500, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

export default function DashboardPage() {
  const { user, transactions, dailyMissions } = useApp();


  const level = calculateLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const progress = getLevelProgress(user.points);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return { income, expenses, balance: income - expenses, savings: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0 };
  }, [transactions]);

  // Monthly spending (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short' });
      const spent = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(key))
        .reduce((a, t) => a + t.amount, 0);
      const earned = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(key))
        .reduce((a, t) => a + t.amount, 0);
      months.push({ label, spent, earned });
    }
    return months;
  }, [transactions]);

  const PROFESSIONAL_PALETTE = [
    '#1e3a5f', // Deep corporate blue
    '#3b82f6', // Standard blue
    '#0ea5e9', // Sky blue
    '#64748b', // Slate
    '#94a3b8', // Light slate
    '#0f172a', // Navy
    '#38bdf8', // Light blue
  ];

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const labels = Object.keys(cats);
    return {
      labels,
      values: Object.values(cats),
      colors: labels.map((_, i) => PROFESSIONAL_PALETTE[i % PROFESSIONAL_PALETTE.length]),
    };
  }, [transactions]);

  const barChartData = {
    labels: monthlyData.map(m => m.label),
    datasets: [
      { label: 'Income', data: monthlyData.map(m => m.earned), backgroundColor: '#4f8ef7', borderRadius: 4 },
      { label: 'Expenses', data: monthlyData.map(m => m.spent), backgroundColor: '#f85149', borderRadius: 4 },
    ],
  };

  const doughnutData = {
    labels: categoryData.labels,
    datasets: [{
      data: categoryData.values,
      backgroundColor: categoryData.colors,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const textColor = 'rgba(255,255,255,0.6)';
  const gridColor = 'rgba(255,255,255,0.08)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter', size: 14 }, usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: 'rgba(30,30,30,0.8)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.6)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxPadding: 6,
        titleFont: { size: 16 },
        bodyFont: { size: 15 },
      },
    },
    scales: {
      x: { ticks: { color: textColor, font: { family: 'Inter', size: 14 } }, grid: { color: gridColor, drawBorder: false } },
      y: { ticks: { color: textColor, font: { family: 'Inter', size: 14 } }, grid: { color: gridColor, drawBorder: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Inter', size: 14 }, padding: 16, usePointStyle: true } },
      tooltip: { ...chartOptions.plugins.tooltip },
    },
    cutout: '65%',
  };

  const recentTransactions = transactions.slice(0, 5);

  // Professional Inline SVGs for Cards
  const CardIcons = {
    balance: (
      <svg className="w-8 h-8 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    income: (
      <svg className="w-8 h-8 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    expense: (
      <svg className="w-8 h-8 text-[#f85149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    savings: (
      <svg className="w-8 h-8 text-[#d29922]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  };

  const statCards = [
    { label: 'Total Balance', value: stats.balance, icon: CardIcons.balance, color: stats.balance >= 0 ? '#3fb950' : '#f85149', prefix: '₹', borderColor: '#58a6ff' },
    { label: 'Income', value: stats.income, icon: CardIcons.income, color: '#3fb950', prefix: '₹', borderColor: '#3fb950' },
    { label: 'Expenses', value: stats.expenses, icon: CardIcons.expense, color: '#f85149', prefix: '₹', borderColor: '#f85149' },
    { label: 'Savings Rate', value: stats.savings, icon: CardIcons.savings, color: '#d29922', suffix: '%', borderColor: '#d29922' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">
            Welcome back, <span className="text-[#58a6ff]">{user.username}</span> {level.emoji}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {level.name} • {user.points} points • {progress}% to next level
          </p>
        </div>
        <Link to="/add" className="flex items-center gap-2 text-center justify-center font-bold text-white px-5 py-3 rounded-xl text-sm transition-all duration-300 hover:brightness-110" style={{ background: 'linear-gradient(135deg, #1e3a5f, #7c3aed)' }}>
          ➕ Add Transaction
        </Link>
      </motion.div>

      {/* Daily Missions Bar */}
      <div style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 20px' }}>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold text-white">Daily Missions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyMissions.map(m => (
            <div key={m.id} className="flex items-center gap-3.5 rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className={`text-2xl ${m.completed ? '' : 'grayscale'}`}>{m.completed ? '✅' : '⏳'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white text-sm">{m.title}</p>
                <div className="h-2 mt-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: '#f59e0b' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(m.progress / m.target) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-[#d29922] tracking-wide">+{m.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 * (index + 1) }}
            className="rounded-xl p-6 hover:translate-y-[-2px] transition-all duration-200 flex flex-col justify-between group"
            style={{ background: 'transparent', borderLeft: `4px solid ${card.borderColor}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="mb-1 uppercase tracking-wider text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {card.label}
              </p>
              <p className="text-[32px] font-bold leading-tight" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-xl p-8" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-bold mb-5 text-white">Monthly Overview</h3>
          <div style={{ height: '320px' }}>
            {transactions.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Add transactions to see your monthly overview
              </div>
            )}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="rounded-xl p-8" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-bold mb-5 text-white">Category Breakdown</h3>
          <div style={{ height: '320px' }}>
            {categoryData.labels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
                No expense data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="font-bold text-white">Recent Transactions</h3>
          {transactions.length > 5 && (
            <Link to="/transactions" className="text-xs font-bold text-[#58a6ff] hover:text-[#58a6ff]/80 transition-colors">
              View all →
            </Link>
          )}
        </div>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Transaction</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Category</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Date</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 * (i + 1) }}
                    className="hover:bg-white/10 transition-all duration-200 h-[64px]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <td className="py-2 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {CATEGORY_ICONS[tx.category] || '📦'}
                        </div>
                        <span className="font-bold text-white">{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {tx.category}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {tx.date}
                    </td>
                    <td className={`py-2 px-4 whitespace-nowrap text-right font-bold text-lg ${tx.type === 'income' ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="text-5xl block mb-3">🌱</span>
            <p>No transactions yet. Start tracking!</p>
          </div>
        )}
      </div>

      {/* Tree avatar mini */}
      <div className="rounded-xl text-center p-8" style={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-7xl mb-4 animate-tree-grow">{level.treeEmoji}</div>
        <p className="font-bold text-white">{level.name}</p>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {nextLevel ? `${nextLevel.minPoints - user.points} pts to ${nextLevel.name}` : 'Max level reached! 🏆'}
        </p>
        <div className="h-2 mt-4 max-w-sm mx-auto rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #58a6ff, #3fb950)' }} />
        </div>
      </div>
    </div>
  );
}
