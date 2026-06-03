'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore, getLevelTitle } from '@/lib/store';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { useState } from 'react';

export default function InsightsPage() {
  const { totalBalance, transactions, xp, level, exportCSV, addNotification, budgets } = useStore();
  const [trendPeriod, setTrendPeriod] = useState<'6M' | '1Y'>('6M');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const changePercent = totalExpenses > 0 ? ((totalIncome - totalExpenses) / totalExpenses * 100).toFixed(1) : '0';

  // Category spending breakdown
  const categorySpending: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });
  const totalCatSpend = Object.values(categorySpending).reduce((s, v) => s + v, 0);
  const topCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const essentialsPct = topCategories.length > 0 ? Math.round((topCategories[0][1] / Math.max(1, totalCatSpend)) * 100) : 45;

  // Monthly spending data (last 6 months)
  const monthlySpending: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
    const spent = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((s, t) => s + t.amount, 0);
    monthlySpending.push({ month: monthLabel, amount: spent });
  }
  const maxMonthSpend = Math.max(...monthlySpending.map(m => m.amount), 1);

  // Skill ratings
  const savingRank = level >= 30 ? 'ELITE' : level >= 20 ? 'PRO' : level >= 10 ? 'ADEPT' : 'NOVICE';
  const investingRank = level >= 35 ? 'ELITE' : level >= 25 ? 'PRO' : level >= 15 ? 'ADEPT' : 'NOVICE';
  const spendingRank = totalExpenses < totalIncome * 0.5 ? 'ELITE' : totalExpenses < totalIncome * 0.7 ? 'PRO' : totalExpenses < totalIncome * 0.9 ? 'ADEPT' : 'NOVICE';

  const handleGenerateReport = () => {
    const csv = exportCSV();
    downloadCSV(csv, `spentree-report-${new Date().toISOString().split('T')[0]}.csv`);
    addNotification('Financial report generated and downloaded!', 'success');
  };

  const handleExportCSV = () => {
    const csv = exportCSV();
    downloadCSV(csv, `spentree-data-${new Date().toISOString().split('T')[0]}.csv`);
    addNotification('CSV exported successfully!', 'success');
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto space-y-12">
        {/* Hero Balance Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase opacity-70">CURRENT LIQUIDITY</span>
            <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter text-primary">{formatCurrency(totalBalance)}</h1>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+{changePercent}% from last quarter</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              className="h-12 px-6 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-semibold active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,53,39,0.15)]"
            >
              Generate Report
            </button>
            <button
              onClick={handleExportCSV}
              className="h-12 px-6 bg-surface-container-low text-primary rounded-xl font-semibold hover:bg-surface-container hover:shadow-sm active:scale-95 transition-all"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Financial Skill Tree */}
          <section className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="font-headline text-2xl font-bold text-primary">Financial Skill Tree</h2>
                <p className="text-on-surface-variant/80">Your path to ultimate capital mastery</p>
              </div>
              <div className="bg-primary-fixed px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <span className="text-on-primary-fixed font-bold text-xs tracking-wider">LEVEL {level} {getLevelTitle(level).toUpperCase()}</span>
              </div>
            </div>

            <div className="relative h-[400px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line className="stroke-outline-variant" strokeDasharray="4" strokeWidth="2" x1="50%" x2="25%" y1="50%" y2="25%" />
                <line className="stroke-outline-variant" strokeDasharray="4" strokeWidth="2" x1="50%" x2="75%" y1="50%" y2="25%" />
                <line className="stroke-outline-variant" strokeDasharray="4" strokeWidth="2" x1="50%" x2="50%" y1="50%" y2="75%" />
              </svg>

              <div className="absolute z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary-fixed-dim">
                <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
              </div>

              <div className="absolute top-[15%] left-[18%] text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-md mb-2 rotate-12 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-emerald-800 text-2xl">savings</span>
                </div>
                <span className="text-xs font-bold text-emerald-900 tracking-wide">SAVING</span>
                <div className="text-[10px] text-emerald-600 font-medium">RANK: {savingRank}</div>
              </div>

              <div className="absolute top-[15%] right-[18%] text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md mb-2 -rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-blue-800 text-2xl">trending_up</span>
                </div>
                <span className="text-xs font-bold text-blue-900 tracking-wide">INVESTING</span>
                <div className="text-[10px] text-blue-600 font-medium">RANK: {investingRank}</div>
              </div>

              <div className="absolute bottom-[15%] left-[44%] text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-orange-800 text-2xl">shopping_cart</span>
                </div>
                <span className="text-xs font-bold text-orange-900 tracking-wide">SPENDING</span>
                <div className="text-[10px] text-orange-600 font-medium">RANK: {spendingRank}</div>
              </div>
            </div>
          </section>

          {/* Category Allocation */}
          <section className="md:col-span-4 bg-surface-container-highest rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary mb-2">Category Allocation</h2>
              <p className="text-on-surface-variant text-sm">Visualizing your resource flow</p>
            </div>
            <div className="relative py-8 flex justify-center">
              <div className="w-48 h-48 rounded-full border-[12px] border-emerald-900 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-[10px] border-emerald-700 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-[8px] border-emerald-500 flex items-center justify-center">
                    <span className="font-headline font-bold text-primary">{essentialsPct}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map(([cat, amt], i) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-900' : i === 1 ? 'bg-emerald-700' : 'bg-emerald-500'}`} />
                      <span className="text-sm font-medium capitalize">{cat}</span>
                    </div>
                    <span className="text-sm font-bold">{totalCatSpend > 0 ? Math.round((amt / totalCatSpend) * 100) : 0}%</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-900" /><span className="text-sm font-medium">Essentials</span></div><span className="text-sm font-bold">45%</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-700" /><span className="text-sm font-medium">Discretionary</span></div><span className="text-sm font-bold">30%</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm font-medium">Savings</span></div><span className="text-sm font-bold">25%</span></div>
                </>
              )}
            </div>
          </section>

          {/* Spending Trends */}
          <section className="md:col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <h2 className="font-headline text-2xl font-bold text-primary">Spending Trends</h2>
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button
                  onClick={() => setTrendPeriod('6M')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${trendPeriod === '6M' ? 'bg-white shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
                >
                  6 MONTHS
                </button>
                <button
                  onClick={() => setTrendPeriod('1Y')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${trendPeriod === '1Y' ? 'bg-white shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
                >
                  1 YEAR
                </button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {monthlySpending.map((m, i) => {
                const h = maxMonthSpend > 0 ? Math.max(5, (m.amount / maxMonthSpend) * 100) : 5;
                return (
                  <div key={i} className="flex-1 bg-surface-container rounded-t-lg relative group cursor-pointer hover:bg-primary-container transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(m.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
              {monthlySpending.map((m, i) => <span key={i}>{m.month}</span>)}
            </div>
          </section>

          {/* Stats Summary */}
          <section className="md:col-span-12 lg:col-span-5 bg-surface rounded-[2rem] p-8">
            <h2 className="font-headline text-2xl font-bold text-primary mb-8">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm">arrow_downward</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Total Income</h4>
                    <span className="text-[10px] font-bold text-secondary uppercase">All Time</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-secondary">{formatCurrency(totalIncome)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-sm">arrow_upward</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Total Expenses</h4>
                    <span className="text-[10px] font-bold text-error uppercase">All Time</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-error">{formatCurrency(totalExpenses)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">savings</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Net Savings</h4>
                    <span className="text-[10px] font-bold text-primary uppercase">All Time</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{formatCurrency(totalIncome - totalExpenses)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-700 text-sm">stars</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Total XP Earned</h4>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Level {level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{xp.toLocaleString('en-IN')} XP</div>
                </div>
              </div>
            </div>
          </section>

          {/* Mastery Cards */}
          <section className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div
              className="bg-primary text-on-primary p-8 rounded-[2rem] flex flex-col justify-between h-64 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
              onClick={() => addNotification('🛡️ ESG Asset recommendation noted! Check Vault for details.', 'info')}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">tips_and_updates</span>
                </div>
                <span className="text-xs font-bold tracking-widest text-primary-fixed uppercase">+500 XP</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold mb-2">Automated Resilience</h3>
                <p className="text-white/70 text-sm">Diversify your portfolio with ESG assets to unlock the &apos;Guardian&apos; badge.</p>
              </div>
            </div>

            <div
              className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between h-64 group hover:bg-primary-fixed transition-colors cursor-pointer active:scale-95"
              onClick={() => addNotification('📊 Trend analysis bookmarked! Your subscription spending is 15% lower than peers.', 'info')}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">+250 XP</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold mb-2 text-primary">Trend Mastery</h3>
                <p className="text-on-surface-variant text-sm group-hover:text-primary">Your spending discipline is trending upward. Keep it up!</p>
              </div>
            </div>

            <div
              className="bg-secondary-container p-8 rounded-[2rem] flex flex-col justify-between h-64 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
              onClick={() => {
                addNotification('💰 Vault Optimization tip: Head to Vault page to contribute to your savings goals!', 'info');
              }}
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-on-secondary-container/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container">account_balance_wallet</span>
                </div>
                <span className="text-xs font-bold tracking-widest text-on-secondary-container uppercase">+750 XP</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold mb-2 text-on-secondary-container">Vault Optimization</h3>
                <p className="text-on-secondary-container/80 text-sm">Transfer to your high-yield Vault to complete your weekly mission.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
