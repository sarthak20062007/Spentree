import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../utils/gamification';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

export default function ReportsPage() {
  const { transactions } = useApp();
  const { theme } = useTheme();

  // Filter state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Filtered summary data (for the selected month/year)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const totalSavings = totalIncome - totalExpense;

  // Last 6 months trend data (stays as trend)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((a, t) => a + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((a, t) => a + t.amount, 0);
      months.push({ label, income, expense, savings: income - expense });
    }
    return months;
  }, [transactions, selectedMonth, selectedYear]);

  const PROFESSIONAL_PALETTE = [
    '#1e3a5f', '#3b82f6', '#0ea5e9', '#64748b', '#94a3b8', '#0f172a', '#38bdf8'
  ];

  // Category totals for the filtered month
  const categoryData = useMemo(() => {
    const cats = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([k]) => k),
      values: sorted.map(([, v]) => v),
      colors: sorted.map((_, i) => PROFESSIONAL_PALETTE[i % PROFESSIONAL_PALETTE.length]),
    };
  }, [filteredTransactions]);

  const isLight = theme === 'light';
  const textColor = isLight ? '#475569' : '#8b949e';
  const gridColor = isLight ? '#e2e8f0' : '#30363d';

  const baseOptions = {
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

  // Income vs Expense chart
  const incomeVsExpenseData = {
    labels: monthlyTrendData.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrendData.map(m => m.income),
        backgroundColor: '#1e3a5f',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: monthlyTrendData.map(m => m.expense),
        backgroundColor: '#ef4444',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Savings trend
  const savingsTrendData = {
    labels: monthlyTrendData.map(m => m.label),
    datasets: [{
      label: 'Savings',
      data: monthlyTrendData.map(m => m.savings),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: isLight ? '#ffffff' : '#1e293b',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  // Category doughnut
  const categoryDoughnutData = {
    labels: categoryData.labels,
    datasets: [{
      data: categoryData.values,
      backgroundColor: categoryData.colors,
      borderWidth: 0,
      hoverOffset: 12,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 14 }, padding: 16, usePointStyle: true, boxWidth: 8 } },
      tooltip: { ...baseOptions.plugins.tooltip },
    },
    cutout: '60%',
  };

  if (transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>Reports</h1>
          <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>Visualize your financial data</p>
        </div>
        <div className="bg-white dark:bg-[#1c2128] rounded-xl p-8 shadow-sm border border-slate-200 dark:border-[#30363d] text-center py-24">
          <span className="text-7xl block mb-6">📊</span>
          <h3 className="font-card-title mb-3" style={{ color: 'var(--color-text-secondary)' }}>No data yet</h3>
          <p className="font-body" style={{ color: 'var(--color-text-faint)' }}>Add some transactions to see beautiful reports here.</p>
        </div>
      </div>
    );
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2025, 2026];

  return (
    <div className="space-y-8">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>Financial Reports</h1>
          <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>Analytical statements for {months[selectedMonth]} {selectedYear}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group/select">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="appearance-none bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-[#30363d] rounded-lg px-5 py-3 pr-12 font-label text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700 min-w-[140px]"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <span className="absolute right-4 top-[52%] -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] group-hover/select:text-blue-500 transition-colors">▼</span>
          </div>
          <div className="relative group/select">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="appearance-none bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-[#30363d] rounded-lg px-5 py-3 pr-12 font-label text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700 min-w-[100px]"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="absolute right-4 top-[52%] -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] group-hover/select:text-blue-500 transition-colors">▼</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          className="bg-white dark:bg-[#1c2128] rounded-xl p-6 shadow-sm border border-slate-200 dark:border-[#30363d] border-l-[6px]"
          style={{ borderLeftColor: isLight ? '#2563eb' : '#58a6ff' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-body font-bold text-slate-500 uppercase tracking-wider text-xs">Total Revenue</p>
            <span className="text-xl">💰</span>
          </div>
          <p className="font-card-value text-slate-900 dark:text-white">₹{totalIncome.toLocaleString()}</p>
        </div>
        
        <div 
          className="bg-white dark:bg-[#1c2128] rounded-xl p-6 shadow-sm border border-slate-200 dark:border-[#30363d] border-l-[6px]"
          style={{ borderLeftColor: '#f85149' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-body font-bold text-slate-500 uppercase tracking-wider text-xs">Total Expenditure</p>
            <span className="text-xl">💸</span>
          </div>
          <p className="font-card-value text-slate-900 dark:text-white">₹{totalExpense.toLocaleString()}</p>
        </div>

        <div 
          className="bg-white dark:bg-[#1c2128] rounded-xl p-6 shadow-sm border border-slate-200 dark:border-[#30363d] border-l-[6px]"
          style={{ borderLeftColor: isLight ? '#10b981' : '#3fb950' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-body font-bold text-slate-500 uppercase tracking-wider text-xs">Net Operating Profit</p>
            <span className="text-xl">📈</span>
          </div>
          <p className={`font-card-value ${totalSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
            ₹{totalSavings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Primary Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expense (Trend) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="font-card-title mb-8 text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full" />
            Cash Flow Analysis
          </h3>
          <div style={{ height: '320px' }}>
            <Bar data={incomeVsExpenseData} options={baseOptions} />
          </div>
        </div>

        {/* Savings Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="font-card-title mb-8 text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
            Savings Growth Matrix
          </h3>
          <div style={{ height: '320px' }}>
            <Line data={savingsTrendData} options={baseOptions} />
          </div>
        </div>
      </div>

      {/* Category Breakdown (Detailed) */}
      {categoryData.labels.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="font-card-title mb-10 text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full" />
            Sector Wise Allocation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div style={{ height: '340px' }} className="relative">
              <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                <p className="text-slate-400 font-label text-xs uppercase">Total Spend</p>
                <p className="text-slate-800 dark:text-white font-bold text-xl">₹{totalExpense.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {categoryData.labels.map((label, i) => (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: categoryData.colors[i] }} />
                      <span className="font-body font-bold text-slate-700 dark:text-slate-200 text-sm tracking-tight">{label}</span>
                    </div>
                    <span className="font-body font-bold text-slate-900 dark:text-white text-sm">₹{categoryData.values[i].toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-50 dark:bg-[#161b22]/50 rounded-full overflow-hidden border border-slate-100 dark:border-[#30363d]">
                    <div 
                      className="h-full transition-all duration-700" 
                      style={{ 
                        width: `${(categoryData.values[i] / totalExpense) * 100}%`,
                        background: categoryData.colors[i]
                      }} 
                    />
                  </div>
                  <p className="text-right font-label text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                    {Math.round((categoryData.values[i] / totalExpense) * 100)}% Allocation
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
