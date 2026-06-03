'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore, getLevelTitle } from '@/lib/store';
import { formatCurrency, formatDate, downloadCSV, getCategoryIcon } from '@/lib/utils';

export default function Home() {
  const { profile, level, streak, totalBalance, transactions, quests, xp, activeTimePeriod, setTimePeriod, exportCSV, addNotification } = useStore();

  const handleExport = () => {
    const csv = exportCSV();
    downloadCSV(csv, `spentree-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    addNotification('Transaction archive exported successfully!', 'success');
  };

  const recentTxs = transactions.slice(0, 4);
  const activeQuests = quests.filter(q => !q.completed);

  const getChangePercent = () => {
    const months = activeTimePeriod === '1M' ? 1 : activeTimePeriod === '6M' ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const periodTxs = transactions.filter(t => new Date(t.date) >= cutoff);
    const income = periodTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = periodTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    if (expense === 0) return 0;
    return ((income - expense) / expense * 100).toFixed(1);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-8 max-w-screen-2xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase mb-2 opacity-80">LEVEL {level} {getLevelTitle(level).toUpperCase()}</p>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-primary leading-tight font-headline">
              Welcome back, <span className="text-secondary">{profile.name}</span>
            </h1>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 shadow-[0_20px_40px_rgba(0,53,39,0.04)]">
            <div className="flex flex-col">
              <span className="text-[0.65rem] font-bold tracking-widest text-outline uppercase mb-1">Active Streak</span>
              <span className="text-3xl font-extrabold text-primary font-headline">{streak} Days</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Financial Status Card */}
          <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(0,53,39,0.04)] overflow-hidden relative">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-sm font-bold tracking-widest text-outline uppercase mb-1">Financial Status</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-primary font-headline tracking-tighter">{formatCurrency(totalBalance)}</span>
                  <span className="text-secondary font-semibold text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +{getChangePercent()}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {(['1M', '6M', '1Y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTimePeriod === p ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full relative group">
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "rgba(0, 108, 73, 0.1)", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "rgba(0, 108, 73, 0)", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,40 L800,200 L0,200 Z" fill="url(#gradient)" />
                <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,40" fill="none" stroke="#006c49" strokeLinecap="round" strokeWidth="4" />
                <circle cx="800" cy="40" fill="#006c49" r="6" />
              </svg>
            </div>
          </section>

          {/* Quest Center */}
          <section className="md:col-span-4 flex flex-col gap-8">
            <div className="bg-primary-container p-8 rounded-xl text-on-primary relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-[0.65rem] font-bold tracking-[0.2em] text-primary-fixed uppercase mb-4">Quest Center</h2>
                {activeQuests.slice(0, 2).map(quest => (
                  <div key={quest.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-headline font-bold">{quest.title}</span>
                      <span className="text-xs font-medium text-primary-fixed">
                        {quest.progress}/{quest.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-fixed rounded-full transition-all" style={{ width: `${Math.min((quest.progress / quest.total) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
                {activeQuests.length === 0 && <p className="text-primary-fixed text-sm">All quests completed! 🎉</p>}
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-20 pointer-events-none transition-transform group-hover:scale-110 duration-500">
                <span className="material-symbols-outlined text-[12rem]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">savings</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider">Total XP</p>
                    <p className="text-lg font-bold text-primary font-headline">{xp.toLocaleString('en-IN')} XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider">Transactions</p>
                    <p className="text-lg font-bold text-primary font-headline">{transactions.length} Logged</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mastery Log */}
          <section className="md:col-span-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-sm font-bold tracking-widest text-outline uppercase mb-1">Mastery Log</h2>
                <h3 className="text-2xl font-extrabold text-primary font-headline tracking-tight">Recent Tactical Moves</h3>
              </div>
              <button onClick={handleExport} className="text-sm font-bold text-secondary hover:underline transition-all">Export Archive</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTxs.length === 0 ? (
                <div className="md:col-span-2 text-center py-12 bg-surface-container-lowest rounded-xl">
                  <span className="material-symbols-outlined text-5xl text-outline/30 mb-4 block">receipt_long</span>
                  <p className="text-outline font-medium">No transactions yet. Head to the <a href="/log" className="text-secondary underline">Log</a> to record your first!</p>
                </div>
              ) : (
                recentTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl group hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors">
                        <span className="material-symbols-outlined">{getCategoryIcon(tx.category)}</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-primary">{tx.merchant || tx.category}</p>
                        <p className="text-xs text-outline font-medium">{tx.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold font-headline ${tx.type === 'income' ? 'text-secondary' : 'text-error'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[0.65rem] font-bold text-outline-variant uppercase">{formatDate(tx.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
