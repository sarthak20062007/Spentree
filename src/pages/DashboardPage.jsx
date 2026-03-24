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
    '#1e3a5f', '#3b82f6', '#0ea5e9', '#64748b', '#94a3b8', '#0f172a', '#38bdf8',
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
    { label: 'Total Balance', value: stats.balance, icon: CardIcons.balance, color: stats.balance >= 0 ? '#3fb950' : '#f85149', prefix: '₹' },
    { label: 'Income', value: stats.income, icon: CardIcons.income, color: '#3fb950', prefix: '₹' },
    { label: 'Expenses', value: stats.expenses, icon: CardIcons.expense, color: '#f85149', prefix: '₹' },
    { label: 'Savings Rate', value: stats.savings, icon: CardIcons.savings, color: '#d29922', suffix: '%' },
  ];

  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex justify-between items-center py-6 gap-8 border-b border-white/5"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-2 text-[#e6edf3] truncate">
            Welcome back, <span className="text-[#58a6ff]">{user.username}</span> {level.emoji}
          </h1>
          <p className="text-sm opacity-60 text-white font-medium">
            {level.name} • {user.points} points • {progress}% to next level
          </p>
        </div>
        <Link to="/add" className="shrink-0 flex items-center gap-2 justify-center font-bold text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #1e3a5f, #7c3aed)' }}>
          ➕ Add Transaction
        </Link>
      </motion.div>

      {/* Daily Missions */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">🎯 Daily Missions</h3>
        <div className="flex flex-row gap-8 overflow-x-auto pb-4">
          {dailyMissions.map(m => (
            <div key={m.id} className="min-w-[220px] flex-1">
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-2xl ${m.completed ? '' : 'grayscale'}`}>{m.completed ? '✅' : '🎯'}</span>
                <p className="font-medium text-white flex-1 truncate">{m.title}</p>
                <span className="text-xs font-bold text-[#d29922] bg-[#d29922]/10 px-2 py-1 rounded-lg shrink-0 border border-[#d29922]/20">
                  +{m.reward}
                </span>
              </div>
              <div className="flex justify-between text-xs text-white/50 font-medium mt-3 mb-1">
                <span>Progress</span>
                <span>{m.progress} / {m.target}</span>
              </div>
              <div className="h-2 mt-2 w-full rounded-full overflow-hidden bg-white/10 border border-white/5 shadow-inner">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.completed ? '#3fb950' : '#58a6ff' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${(m.progress / m.target) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 min-h-[120px] flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 * (index + 1) }}
          >
            <div className="flex items-center justify-between">
              {card.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 mt-3 text-white/80 font-bold mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20">
          <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span> Monthly Overview
          </h3>
          <div className="min-h-[260px] h-[260px]">
            {transactions.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                Add transactions to see overview
              </div>
            )}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20">
          <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span> Category Breakdown
          </h3>
          <div className="min-h-[260px] h-[260px]">
            {categoryData.labels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                No expense data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-green-500 rounded-full"></span> Recent Transactions
          </h3>
          {transactions.length > 5 && (
            <Link to="/transactions" className="text-xs font-bold text-[#58a6ff] hover:text-[#58a6ff]/80 transition-colors bg-[#58a6ff]/10 px-3 py-1.5 rounded-lg border border-[#58a6ff]/20">
              View all →
            </Link>
          )}
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="w-full">
            <div className="flex items-center py-3 text-xs uppercase tracking-widest opacity-40 border-b border-white/10 mb-2 text-white/80 font-bold">
              <div className="flex-[2] px-4 min-w-0">Transaction</div>
              <div className="flex-1 hidden md:block px-4">Category</div>
              <div className="flex-1 px-4 text-center">Date</div>
              <div className="flex-1 px-4 text-right">Amount</div>
            </div>
            
            <div className="flex flex-col">
              {recentTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 * (i + 1) }}
                  className="flex items-center py-4 min-h-[60px] border-b border-white/5 gap-4 hover:bg-white/5 transition-colors px-2 rounded-xl last:border-0"
                >
                  <div className="flex-[2] flex items-center gap-4 min-w-0 px-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/5 shrink-0 text-lg shadow-sm">
                      {CATEGORY_ICONS[tx.category] || '📦'}
                    </div>
                    <span className="font-bold text-white truncate text-[15px]">{tx.title}</span>
                  </div>
                  <div className="flex-1 hidden md:block text-sm text-white/50 truncate px-4">{tx.category}</div>
                  <div className="flex-1 text-xs text-white/40 text-center px-4 font-medium">{tx.date}</div>
                  <div className={`flex-1 text-right font-bold text-base px-2 truncate ${tx.type === 'income' ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-dashed border-white/10 mt-6">
            <span className="text-4xl block mb-3 saturate-50 opacity-80">🌱</span>
            <p className="font-medium">No transactions yet. Start tracking!</p>
          </div>
        )}
      </div>

    </div>
  );
}
