'use client';

import { useState } from 'react';
import { useStore, getLevelTitle } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function ProfileModal() {
  const { profile, updateProfile, showProfileModal, toggleProfileModal, xp, level, streak, totalBalance, transactions, logout } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  if (!showProfileModal) return null;

  const handleSave = () => {
    updateProfile({ name, email });
    setEditMode(false);
  };

  const xpToNext = 1000 - (xp % 1000);
  const xpProgress = ((xp % 1000) / 1000) * 100;

  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={toggleProfileModal}>
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-container p-8 text-white relative">
          <button onClick={toggleProfileModal} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold">{profile.name}</h2>
              <p className="text-primary-fixed text-sm">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Level {level}</span>
                <span className="bg-secondary-fixed/30 px-3 py-1 rounded-full text-xs font-bold">{getLevelTitle(level)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="px-8 py-4 bg-surface-container-lowest border-b border-outline-variant/10">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-primary">{xp.toLocaleString('en-IN')} XP</span>
            <span className="text-outline">{xpToNext.toLocaleString('en-IN')} XP to Level {level + 1}</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-secondary to-secondary-fixed rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 p-6">
          <div className="text-center p-4 bg-surface-container-low rounded-xl">
            <p className="text-2xl font-headline font-bold text-primary">{streak}</p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Day Streak</p>
          </div>
          <div className="text-center p-4 bg-surface-container-low rounded-xl">
            <p className="text-2xl font-headline font-bold text-primary">{transactions.length}</p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Transactions</p>
          </div>
          <div className="text-center p-4 bg-surface-container-low rounded-xl">
            <p className="text-2xl font-headline font-bold text-primary">{formatCurrency(totalBalance)}</p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Balance</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="px-6 pb-4">
          <div className="flex justify-between p-4 bg-surface-container-lowest rounded-xl">
            <div>
              <p className="text-xs text-outline font-bold uppercase">Total Income</p>
              <p className="text-lg font-bold text-secondary font-headline">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-outline font-bold uppercase">Total Expenses</p>
              <p className="text-lg font-bold text-error font-headline">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="px-6 pb-6">
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-outline uppercase tracking-wider">Name</label>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-outline uppercase tracking-wider">Email</label>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 h-12 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all">Save</button>
                <button onClick={() => setEditMode(false)} className="flex-1 h-12 bg-surface-container-low text-primary rounded-xl font-bold active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="w-full h-12 bg-surface-container-low text-primary rounded-xl font-bold hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  toggleProfileModal();
                }}
                className="w-full h-12 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
