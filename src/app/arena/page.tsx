'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function ArenaPage() {
  const { userCapitalHP, aiCapitalHP, userResilience, aiBenchmark, buffsUsed, useBuff, battleLogs, xp, level, transactions } = useStore();

  const growthRate = transactions.length > 0
    ? ((transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
        transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)) /
       Math.max(1, transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)) * 100).toFixed(1)
    : '0.0';

  const savingsRate = transactions.length > 0
    ? ((transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) > 0
        ? (1 - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) /
           transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)) * 100
        : 0)).toFixed(1)
    : '0.0';

  const buffs = [
    { icon: 'shield', title: 'Boost Shield', desc: 'Protect savings from impulsive drift.' },
    { icon: 'rocket_launch', title: 'Yield Burst', desc: 'Auto-move idle cash to high yield.' },
    { icon: 'savings', title: 'Savings Raid', desc: 'Instantly clear high-interest debt.' },
    { icon: 'bolt', title: 'Diversify Zap', desc: 'Rebalance portfolio instantly.' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-8 max-w-screen-2xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">Financial Battle Arena</h1>
          <p className="text-on-surface-variant font-medium">Session: Fiscal Quarter Q1 2026 • Mastery Duel in Progress</p>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar: AI Targets */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">target</span>
                AI Targets
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Allocation Precision', value: `${Math.min(99, 70 + Math.floor(xp / 1000))}%`, width: `${Math.min(99, 70 + Math.floor(xp / 1000))}%`, color: 'bg-secondary' },
                  { label: 'Spending Efficiency', value: `${userResilience}%`, width: `${userResilience}%`, color: 'bg-primary-container' },
                  { label: 'Yield Optimization', value: `${Math.min(99, 50 + Math.floor(xp / 2000))}%`, width: `${Math.min(99, 50 + Math.floor(xp / 2000))}%`, color: 'bg-primary-fixed-dim' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold tracking-widest uppercase text-on-surface-variant">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-surface-container-low rounded-xl p-6">
              <h4 className="font-headline font-bold text-primary mb-4">Buffs Used</h4>
              <div className="flex flex-wrap gap-2">
                {buffsUsed.length === 0 ? (
                  <p className="text-sm text-outline">No buffs activated yet</p>
                ) : (
                  buffsUsed.map((b, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">{b}</span>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Central Mastery Duel Area */}
          <section className="col-span-12 lg:col-span-6 space-y-8">
            <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-[0_20px_40px_rgba(0,53,39,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-12">
                  <div className="text-center w-full">
                    <span className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Mastery Duel</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-headline text-lg font-bold text-primary mb-1">Your Capital HP</h4>
                    <div className="font-headline text-4xl font-extrabold text-primary tracking-tighter mb-4">{formatCurrency(userCapitalHP)}</div>
                    <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-secondary to-secondary-fixed rounded-full transition-all duration-500" style={{ width: `${userResilience}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant mt-2">{userResilience}% Resilience</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border-4 border-background">
                      <span className="font-headline font-black text-primary italic">VS</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h4 className="font-headline text-lg font-bold text-primary mb-1">Mastery AI</h4>
                    <div className="font-headline text-4xl font-extrabold text-on-surface-variant tracking-tighter mb-4">{formatCurrency(aiCapitalHP)}</div>
                    <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-on-tertiary-container rounded-full" style={{ width: `${aiBenchmark}%` }} />
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant mt-2">{aiBenchmark}% Benchmark</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-headline font-bold text-primary mb-6">Tactical Buffs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {buffs.map((buff) => {
                  const isUsed = buffsUsed.includes(buff.title);
                  return (
                    <button
                      key={buff.title}
                      onClick={() => useBuff(buff.title)}
                      disabled={isUsed}
                      className={`p-5 rounded-xl text-left border transition-all group active:scale-95 ${
                        isUsed
                          ? 'bg-surface-container-high border-outline-variant/20 opacity-60 cursor-not-allowed'
                          : 'bg-surface-container-lowest border-transparent hover:border-secondary/20'
                      }`}
                    >
                      <span className={`material-symbols-outlined mb-3 block transition-transform ${isUsed ? 'text-outline' : 'text-secondary group-hover:scale-110'}`}>
                        {buff.icon}
                      </span>
                      <h5 className="text-sm font-bold text-primary">{buff.title}</h5>
                      <p className="text-[10px] text-on-surface-variant mt-1 font-medium">
                        {isUsed ? '✓ Activated' : buff.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">query_stats</span>
                Your Performance
              </h3>
              <div className="space-y-4">
                {[
                  { icon: 'trending_up', iconBg: 'bg-secondary/10', iconColor: 'text-secondary', label: 'Growth Rate', value: `+${growthRate}%` },
                  { icon: 'warning', iconBg: 'bg-error-container/20', iconColor: 'text-error', label: 'Volatility Risk', value: userResilience > 70 ? 'Low' : userResilience > 40 ? 'Medium' : 'High' },
                  { icon: 'account_balance_wallet', iconBg: 'bg-primary-fixed/30', iconColor: 'text-primary', label: 'Savings Rate', value: `${savingsRate}%` },
                ].map((metric, i) => (
                  <div key={i} className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-4">
                    <div className={`w-10 h-10 ${metric.iconBg} rounded-full flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${metric.iconColor} text-sm`}>{metric.icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">{metric.label}</p>
                      <p className="font-headline font-bold text-primary">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-primary p-6 rounded-xl text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Elite Tip</p>
              <p className="font-headline font-medium leading-relaxed italic">
                &quot;{buffsUsed.length < 4
                  ? `You have ${4 - buffsUsed.length} buff(s) remaining. Use them strategically to close the gap!`
                  : 'All buffs deployed! Monitor your resilience and wait for results.'
                }&quot;
              </p>
              <button
                onClick={() => useBuff(buffs.find(b => !buffsUsed.includes(b.title))?.title || '')}
                disabled={buffsUsed.length >= 4}
                className="mt-6 w-full py-3 bg-secondary rounded-lg font-bold text-sm hover:bg-secondary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buffsUsed.length >= 4 ? 'All Buffs Used' : 'Quick Action'}
              </button>
            </div>
          </aside>
        </div>

        {/* Terminal Battle Log */}
        <section className="mt-12">
          <div className="bg-surface-container-highest/50 rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="bg-surface-container flex items-center px-4 py-2 border-b border-outline-variant/10">
              <div className="flex gap-1.5 mr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">terminal_battle_log_v2.0.4</span>
            </div>
            <div className="p-6 font-mono text-xs leading-relaxed space-y-2 max-h-48 overflow-y-auto">
              {battleLogs.map((entry) => (
                <div key={entry.id} className="flex gap-4">
                  <span className="text-slate-400">[{entry.time}]</span>
                  <span className={entry.typeColor}>{entry.type}</span>
                  <span className="text-slate-600">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
