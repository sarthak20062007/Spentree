import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { calculateLevel, getLevelProgress, getNextLevel, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/gamification';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { user, transactions, dailyMissions } = useApp();
  const { theme } = useTheme();

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
      { label: 'Income', data: monthlyData.map(m => m.earned), backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: 4 },
      { label: 'Expenses', data: monthlyData.map(m => m.spent), backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 4 },
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

  const isLight = theme === 'light';
  const textColor = isLight ? '#475569' : '#8b949e';
  const gridColor = isLight ? '#e2e8f0' : '#30363d';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Inter', size: 14 }, usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#1e293b',
        titleColor: isLight ? '#1e293b' : '#f1f5f9',
        bodyColor: isLight ? '#64748b' : '#94a3b8',
        borderColor: isLight ? '#e2e8f0' : '#334155',
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
      <svg className="w-8 h-8 text-[#1e3a5f] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    income: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    expense: (
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    savings: (
      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  };

  const statCards = [
    { label: 'Total Balance', value: stats.balance, icon: CardIcons.balance, color: stats.balance >= 0 ? '#22c55e' : '#ef4444', prefix: '₹' },
    { label: 'Income', value: stats.income, icon: CardIcons.income, color: '#22c55e', prefix: '₹' },
    { label: 'Expenses', value: stats.expenses, icon: CardIcons.expense, color: '#ef4444', prefix: '₹' },
    { label: 'Savings Rate', value: stats.savings, icon: CardIcons.savings, color: '#f59e0b', suffix: '%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="font-page-title text-slate-900 dark:text-[#e6edf3]">
            Welcome back, <span className="text-blue-600 dark:text-[#58a6ff]">{user.username}</span> {level.emoji}
          </h1>
          <p className="font-body mt-2 text-slate-600 dark:text-[#8b949e]">
            {level.name} • {user.points} points • {progress}% to next level
          </p>
        </div>
        <Link to="/add" className="btn-primary flex items-center gap-2 text-center justify-center !font-bold">
          ➕ Add Transaction
        </Link>
      </div>

      {/* Daily Missions Bar */}
      <div className="card-static !p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-card-title" style={{ color: 'var(--color-text-heading)' }}>Daily Missions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyMissions.map(m => (
            <div key={m.id} className="flex items-center gap-3.5 rounded-xl px-4 py-3 border border-transparent dark:border-[#30363d]/30 transition-all duration-200 hover:border-[#58a6ff]/30 shadow-sm" style={{ background: 'var(--bg-grad-hover)' }}>
              <span className={`text-2xl ${m.completed ? '' : 'grayscale'}`}>{m.completed ? '✅' : '⏳'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium truncate text-slate-700 dark:text-[#e6edf3]">{m.title}</p>
                <div className="progress-bar-bg !h-2 mt-1.5">
                  <div className="progress-bar-fill" style={{ width: `${(m.progress / m.target) * 100}%` }} />
                </div>
              </div>
              <span className="font-label text-amber-400 font-bold tracking-wide">+{m.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div 
            key={card.label} 
            className="bg-white dark:bg-[var(--bg-grad-card)] rounded-xl p-6 shadow-sm dark:shadow-[var(--shadow-premium)] hover:translate-y-[-2px] transition-all duration-200 border border-slate-200 dark:border-[#30363d] border-l-[4px] animate-slide-in flex flex-col justify-between group hover:dark:shadow-[var(--glow-blue)]" 
            style={{ '--stagger': `${index * 0.1}s`, borderLeftColor: isLight ? '#1e3a5f' : (card.label === 'Total Income' ? '#3fb950' : (card.label === 'Total Expenses' ? '#f85149' : '#58a6ff')) }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-slate-50 dark:bg-[#0d1117] p-2.5 rounded-lg border border-slate-100 dark:border-[#30363d] group-hover:dark:border-[#58a6ff]/30 transition-colors">
                {card.icon}
              </div>
            </div>
            <div>
              <p className="font-label text-slate-500 dark:text-[#8b949e] mb-1 uppercase tracking-wider text-[12px]">
                {card.label}
              </p>
              <p className="font-card-value text-[32px] font-bold leading-tight" style={{ color: card.color }}>
                {card.prefix}{card.value.toLocaleString()}{card.suffix}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--bg-grad-card)] rounded-xl p-8 shadow-sm dark:shadow-[var(--glow-blue)] border border-slate-200 dark:border-[#30363d] transition-all duration-300">
          <h3 className="font-card-title mb-5 text-slate-800 dark:text-[#e6edf3]">Monthly Overview</h3>
          <div style={{ height: '320px' }}>
            {transactions.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full font-body" style={{ color: 'var(--color-text-faint)' }}>
                Add transactions to see your monthly overview
              </div>
            )}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-[var(--bg-grad-card)] rounded-xl p-8 shadow-sm dark:shadow-[var(--shadow-premium)] border border-slate-200 dark:border-[#30363d] transition-all duration-300">
          <h3 className="font-card-title mb-5 text-slate-800 dark:text-[#e6edf3]">Category Breakdown</h3>
          <div style={{ height: '320px' }}>
            {categoryData.labels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full font-body" style={{ color: 'var(--color-text-faint)' }}>
                No expense data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-[var(--bg-grad-card)] rounded-xl shadow-sm dark:shadow-[var(--shadow-premium)] border border-slate-200 dark:border-[#30363d] overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-card-title text-slate-800 dark:text-[#e6edf3]">Recent Transactions</h3>
          {transactions.length > 5 && (
            <Link to="/transactions" className="font-label transition-colors" style={{ color: 'var(--color-primary)' }}>
              View all →
            </Link>
          )}
        </div>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#161b22]/50 border-y border-slate-200 dark:border-[#30363d]">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Transaction</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Category</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400">Date</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] dark:text-blue-400 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-[#30363d] last:border-0 hover:bg-blue-50/50 dark:hover:bg-[#21262d] transition-all duration-200 h-[64px] even:bg-slate-50/50 dark:even:bg-[#161b22]/30">
                    <td className="py-2 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] shadow-sm shrink-0 text-xl">
                          {CATEGORY_ICONS[tx.category] || '📦'}
                        </div>
                        <span className="font-body font-bold text-slate-800 dark:text-[#e6edf3]">{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap font-body text-slate-600 dark:text-slate-300">
                      {tx.category}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap font-label text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </td>
                    <td className={`py-2 px-4 whitespace-nowrap text-right font-body font-bold text-lg ${tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-500 dark:text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--color-text-faint)' }}>
            <span className="text-5xl block mb-3">🌱</span>
            <p className="font-body">No transactions yet. Start tracking!</p>
          </div>
        )}
      </div>

      {/* Tree avatar mini */}
      <div className="bg-white dark:bg-[var(--bg-grad-card)] rounded-xl text-center p-8 shadow-sm dark:shadow-[var(--shadow-premium)] border border-slate-200 dark:border-[#30363d]">
        <div className="text-7xl mb-4 animate-tree-grow">{level.treeEmoji}</div>
        <p className="font-card-title text-slate-800 dark:text-[#e6edf3]">{level.name}</p>
        <p className="font-label mt-2 text-slate-500 dark:text-[#8b949e]">
          {nextLevel ? `${nextLevel.minPoints - user.points} pts to ${nextLevel.name}` : 'Max level reached! 🏆'}
        </p>
        <div className="progress-bar-bg !h-2 mt-4 max-w-sm mx-auto">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
