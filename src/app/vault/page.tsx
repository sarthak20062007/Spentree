'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function VaultPage() {
  const { budgets, savingsGoals, updateBudget, contributeSavings, addSavingsGoal, deleteSavingsGoal, totalBalance, transactions, addNotification } = useStore();
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const consumedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Get top spending category for insight
  const topCategory = [...budgets].sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))[0];
  const potentialSaving = topCategory ? Math.round(topCategory.spent * 0.15) : 0;

  const handleSaveBudget = (id: string) => {
    const val = parseInt(newLimit);
    if (!isNaN(val) && val > 0) {
      updateBudget(id, { limit: val });
      addNotification(`Budget limit updated to ${formatCurrency(val)}`, 'success');
    }
    setEditingBudget(null);
    setNewLimit('');
  };

  const handleContribute = (id: string) => {
    const val = parseInt(contributeAmount);
    if (!isNaN(val) && val > 0) {
      contributeSavings(id, val);
    }
    setContributeId(null);
    setContributeAmount('');
  };

  const handleAddGoal = () => {
    const target = parseInt(newGoalTarget);
    if (newGoalTitle && !isNaN(target) && target > 0) {
      addSavingsGoal({
        title: newGoalTitle,
        description: newGoalDesc || 'New savings goal',
        current: 0,
        target,
        color: 'text-secondary',
      });
      setNewGoalTitle('');
      setNewGoalDesc('');
      setNewGoalTarget('');
      setShowAddGoal(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 max-w-screen-2xl mx-auto px-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-bold">Current Standing</span>
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary mt-2">
                {formatCurrency(totalSpent)} <span className="text-lg font-medium text-slate-400">/ {formatCurrency(totalLimit)}</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="font-headline text-lg font-bold text-primary">{consumedPct}% Consumed</p>
              <p className="text-sm text-slate-500">{daysRemaining} days remaining in period</p>
            </div>
          </div>
          <div className="h-4 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${consumedPct > 90 ? 'bg-error' : 'bg-gradient-to-r from-primary to-primary-container'}`}
              style={{ width: `${Math.min(consumedPct, 100)}%` }}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="md:col-span-8 space-y-10">
            <header className="flex justify-between items-center">
              <h2 className="font-headline text-2xl font-bold text-primary">Budget Allocations</h2>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {budgets.map((budget) => {
                const pct = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
                return (
                  <div key={budget.id} className="p-6 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(0,53,39,0.02)] border border-outline-variant/10">
                    <div className="flex justify-between mb-6">
                      <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{budget.icon}</span>
                      </div>
                      <span className={`text-xs font-bold ${pct >= 100 ? 'text-error' : pct >= 80 ? 'text-amber-500' : 'text-slate-400'}`}>{pct}%</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg mb-1">{budget.category}</h3>
                    <p className="text-sm text-slate-500 mb-4">{formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}</p>
                    <div className="h-1.5 w-full bg-surface-container-low rounded-full mb-4">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-error' : pct >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    {editingBudget === budget.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newLimit}
                          onChange={(e) => setNewLimit(e.target.value)}
                          placeholder="New limit"
                          className="flex-1 bg-surface-container-highest border-none rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                        <button onClick={() => handleSaveBudget(budget.id)} className="px-4 bg-primary text-white rounded-lg text-sm font-bold active:scale-95">Save</button>
                        <button onClick={() => setEditingBudget(null)} className="px-3 bg-surface-container-low rounded-lg text-sm">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingBudget(budget.id); setNewLimit(String(budget.limit)); }}
                        className="text-xs font-bold text-secondary hover:underline transition-all"
                      >
                        Adjust Limit
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Savings Goals */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-2xl font-bold text-primary">Savings Goals</h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-1 text-sm font-bold text-secondary hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Goal
                </button>
              </div>

              {showAddGoal && (
                <div className="p-6 bg-surface-container-lowest rounded-2xl mb-4 border border-outline-variant/20 space-y-4">
                  <input value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} placeholder="Goal title" className="w-full bg-surface-container-highest border-none rounded-lg h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20" />
                  <input value={newGoalDesc} onChange={(e) => setNewGoalDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-surface-container-highest border-none rounded-lg h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20" />
                  <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="Target amount (₹)" className="w-full bg-surface-container-highest border-none rounded-lg h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20" />
                  <div className="flex gap-3">
                    <button onClick={handleAddGoal} className="flex-1 h-12 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all">Create Goal</button>
                    <button onClick={() => setShowAddGoal(false)} className="flex-1 h-12 bg-surface-container-low rounded-xl font-bold active:scale-95 transition-all">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {savingsGoals.map((goal) => {
                  const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                  return (
                    <div key={goal.id} className="group p-1 bg-surface-container-low rounded-2xl">
                      <div className="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-xl">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3" />
                            <path className={goal.color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeDasharray={`${pct}, 100`} strokeLinecap="round" strokeWidth="3" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{pct}%</div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-headline font-bold text-lg">{goal.title}</h4>
                          <p className="text-sm text-slate-500">{goal.description}</p>
                          {contributeId === goal.id ? (
                            <div className="flex gap-2 mt-3">
                              <input
                                type="number"
                                value={contributeAmount}
                                onChange={(e) => setContributeAmount(e.target.value)}
                                placeholder="Amount (₹)"
                                className="flex-1 bg-surface-container-highest border-none rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                              />
                              <button onClick={() => handleContribute(goal.id)} className="px-4 bg-secondary text-white rounded-lg text-sm font-bold active:scale-95">Add</button>
                              <button onClick={() => setContributeId(null)} className="px-3 bg-surface-container-low rounded-lg text-sm">✕</button>
                            </div>
                          ) : (
                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => setContributeId(goal.id)}
                                className="text-xs font-bold text-secondary hover:underline"
                              >
                                + Contribute
                              </button>
                              <button
                                onClick={() => deleteSavingsGoal(goal.id)}
                                className="text-xs font-bold text-error/60 hover:text-error hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-primary">{formatCurrency(goal.current)}</p>
                          <p className="text-xs text-slate-400">Target: {formatCurrency(goal.target)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {savingsGoals.length === 0 && (
                  <div className="text-center py-8 text-outline">
                    <p>No savings goals yet. Create one to start saving!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside className="md:col-span-4 space-y-8">
            <div className="bg-primary p-8 rounded-[2rem] text-on-primary shadow-xl">
              <span className="material-symbols-outlined text-secondary-container text-4xl mb-6 block">psychology</span>
              <h2 className="font-headline text-2xl font-bold mb-4 tracking-tight">Personalized Insights</h2>
              <p className="text-emerald-100/80 mb-8 leading-relaxed">
                {topCategory ? (
                  <>Based on your spending in &apos;{topCategory.category}&apos;, you could save <span className="text-white font-bold">{formatCurrency(potentialSaving)}/month</span> by optimizing your spending.</>
                ) : (
                  <>Start logging transactions to get personalized insights!</>
                )}
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-primary-container/40 rounded-xl border border-emerald-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Recommendation</p>
                  <p className="text-sm font-medium">
                    {consumedPct > 80 ? 'Consider reducing discretionary spending this week.' : 'You\'re on track! Keep maintaining your budget discipline.'}
                  </p>
                </div>
                <button
                  onClick={() => addNotification('Recommendation applied! We\'ll track your progress.', 'success')}
                  className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-xl font-bold hover:brightness-105 transition-all active:scale-[0.98]"
                >
                  Apply Recommendation
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-[2rem]">
              <h3 className="font-headline font-bold text-lg mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-outline">Daily Budget</span>
                  <span className="font-bold text-primary">{formatCurrency(Math.round((totalLimit - totalSpent) / Math.max(1, daysRemaining)))}/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-outline">Balance</span>
                  <span className="font-bold text-primary">{formatCurrency(totalBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-outline">Savings Goals</span>
                  <span className="font-bold text-primary">{savingsGoals.length} active</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
