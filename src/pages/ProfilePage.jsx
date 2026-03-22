import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  calculateLevel, getNextLevel, getLevelProgress,
  getAllBadges, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS,
} from '../utils/gamification';

export default function ProfilePage() {
  const { user, transactions } = useApp();

  const level = calculateLevel(user.points);
  const nextLevel = getNextLevel(user.points);
  const progress = getLevelProgress(user.points);
  const badges = getAllBadges();
  const earnedBadges = badges.filter(b => user.badges.includes(b.id));

  // ── Stats ──
  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const avgExpense = transactions.filter(t => t.type === 'expense').length > 0
      ? Math.round(totalExpense / transactions.filter(t => t.type === 'expense').length)
      : 0;

    // Top spending category
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    // Active days (unique dates with transactions)
    const uniqueDates = new Set(transactions.map(t => t.date));

    // Streak info
    const streak = user.loginStreak || 0;

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpense,
      avgExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      activeDays: uniqueDates.size,
      streak,
      badgesEarned: earnedBadges.length,
      totalBadges: badges.length,
    };
  }, [transactions, user, earnedBadges, badges]);

  // ── Spending Personality ──
  const personality = useMemo(() => {
    if (transactions.length === 0) return { title: 'New Explorer 🗺️', desc: 'Start logging transactions to discover your spending personality!', color: '#94a3b8' };
    if (stats.savingsRate >= 50) return { title: 'Super Saver 🐷', desc: 'You save more than half your income. Incredible financial discipline!', color: '#22c55e' };
    if (stats.savingsRate >= 25) return { title: 'Smart Planner 🧠', desc: 'Great balance between spending and saving. Keep it up!', color: '#4ade80' };
    if (stats.savingsRate >= 0) return { title: 'Balanced Spender ⚖️', desc: "You spend wisely but there's room to save more.", color: '#f59e0b' };
    return { title: 'Free Spirit 🌊', desc: "You're spending more than you earn. Consider reviewing your budget!", color: '#ef4444' };
  }, [stats, transactions]);

  // ── Level Milestones ──
  const milestones = [
    { tier: 1, name: 'Seedling',      emoji: '🌱', pts: 0,    unlocks: 'Begin your journey' },
    { tier: 2, name: 'Sprout',        emoji: '🌿', pts: 50,   unlocks: 'Daily Mission Tracking' },
    { tier: 3, name: 'Sapling',       emoji: '🪴', pts: 150,  unlocks: 'Badge Collection' },
    { tier: 4, name: 'Young Tree',    emoji: '🌲', pts: 350,  unlocks: 'Spin Wheel Access' },
    { tier: 5, name: 'Mature Tree',   emoji: '🌳', pts: 600,  unlocks: 'Advanced Reports' },
    { tier: 6, name: 'Grand Oak',     emoji: '🌴', pts: 1000, unlocks: 'Leaderboard Elite' },
    { tier: 7, name: 'Ancient Grove', emoji: '🎄', pts: 2000, unlocks: 'Custom Themes' },
    { tier: 8, name: 'World Tree',    emoji: '🎋', pts: 5000, unlocks: 'Legendary Status' },
  ];

  return (
    <div className="space-y-8">
      {/* ═══ Header ═══ */}
      <div>
        <h1 className="font-page-title" style={{ color: 'var(--color-text-heading)' }}>👤 My Profile</h1>
        <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>Your journey, stats, and achievements at a glance</p>
      </div>

      {/* ═══ Profile Hero Card ═══ */}
      <div
        className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
        style={{
          background: 'var(--profile-hero-bg)',
          border: `1px solid var(--profile-hero-border)`,
          boxShadow: 'var(--profile-hero-shadow)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #22c55e, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(-30%, 30%)', opacity: 0.06 }} />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Large avatar */}
          <div className="shrink-0">
            <div
              className="w-32 h-32 rounded-[2rem] flex items-center justify-center font-page-title !text-5xl"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(34,197,94,0.3), 0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center mt-3">
              <span className="text-4xl">{level.treeEmoji}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-page-title text-white !text-[32px]">{user.username}</h2>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
              <span
                className="font-label font-bold px-4 py-1.5 rounded-full tracking-wide"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                {level.emoji} {level.name}
              </span>
              <span
                className="font-label font-bold px-4 py-1.5 rounded-full tracking-wide"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                Tier {level.tier}
              </span>
            </div>

            {/* XP Bar */}
            <div className="mt-6 max-w-lg mx-auto md:mx-0">
              <div className="flex justify-between font-label font-bold mb-2">
                <span className="text-amber-400">{user.points} XP</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{nextLevel ? `${nextLevel.minPoints} XP` : 'MAX'}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #22c55e, #4ade80, #fbbf24)',
                    boxShadow: '0 0 10px rgba(34,197,94,0.4)',
                  }}
                />
              </div>
              <p className="font-label mt-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {nextLevel ? `${nextLevel.minPoints - user.points} XP until ${nextLevel.name} ${nextLevel.treeEmoji}` : '🏆 Maximum level reached!'}
              </p>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
              <QuickStat icon="🔥" label="Streak" value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`} />
              <QuickStat icon="🏅" label="Badges" value={`${stats.badgesEarned}/${stats.totalBadges}`} />
              <QuickStat icon="📝" label="Entries" value={stats.totalTransactions} />
              <QuickStat icon="📅" label="Active Days" value={stats.activeDays} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Spending Personality ═══ */}
      <div
        className="card-static !p-6"
        style={{ borderLeft: `6px solid ${personality.color}` }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${personality.color}15` }}
          >
            {personality.title.split(' ').pop()}
          </div>
          <div>
            <h3 className="font-card-title mb-1" style={{ color: 'var(--color-text-heading)' }}>Your Spending Personality</h3>
            <p className="font-page-title" style={{ color: personality.color }}>
              {personality.title}
            </p>
            <p className="font-body mt-2" style={{ color: 'var(--color-text-muted)' }}>{personality.desc}</p>
          </div>
        </div>
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="💰" label="Total Income" value={`₹${stats.totalIncome.toLocaleString()}`} color="#22c55e" />
        <StatCard icon="💸" label="Total Expenses" value={`₹${stats.totalExpense.toLocaleString()}`} color="#ef4444" />
        <StatCard icon="🐷" label="Net Savings" value={`₹${stats.netSavings.toLocaleString()}`} color={stats.netSavings >= 0 ? '#f59e0b' : '#ef4444'} />
        <StatCard icon="📊" label="Avg Expense" value={`₹${stats.avgExpense.toLocaleString()}`} color="#3b82f6" />
      </div>

      {/* ═══ Savings Rate + Top Category ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Savings Rate Gauge */}
        <div className="card-static !p-6 text-center">
          <h3 className="font-card-title mb-6" style={{ color: 'var(--color-text-secondary)' }}>💎 Savings Rate</h3>
          <div className="relative inline-flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="var(--profile-savings-track)" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke={stats.savingsRate >= 25 ? '#22c55e' : stats.savingsRate >= 0 ? '#f59e0b' : '#ef4444'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, stats.savingsRate) * 3.77} 377`}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div className="absolute text-center mt-2">
              <p className="font-card-value !text-[42px]" style={{ color: 'var(--color-text-heading)' }}>{stats.savingsRate}%</p>
              <p className="font-label" style={{ color: 'var(--color-text-faint)' }}>saved</p>
            </div>
          </div>
          <p className="font-body mt-4 font-medium" style={{ color: 'var(--color-text-faint)' }}>
            {stats.savingsRate >= 50 ? 'Outstanding! 🌟' : stats.savingsRate >= 25 ? 'Great job! 👏' : stats.savingsRate >= 0 ? 'Room to grow 📈' : 'Needs attention ⚠️'}
          </p>
        </div>

        {/* Top Category */}
        <div className="card-static !p-6">
          <h3 className="font-card-title mb-6" style={{ color: 'var(--color-text-secondary)' }}>🏷️ Top Spending Category</h3>
          {stats.topCategory ? (
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4"
                style={{ background: `${CATEGORY_COLORS[stats.topCategory.name] || '#64748b'}18` }}
              >
                {CATEGORY_ICONS[stats.topCategory.name] || '📦'}
              </div>
              <p className="font-page-title mb-1" style={{ color: 'var(--color-text-heading)' }}>{stats.topCategory.name}</p>
              <p className="font-card-value" style={{ color: CATEGORY_COLORS[stats.topCategory.name] || '#64748b' }}>
                ₹{stats.topCategory.amount.toLocaleString()}
              </p>
              <p className="font-body mt-2" style={{ color: 'var(--color-text-faint)' }}>Highest spending area</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="font-body mt-4" style={{ color: 'var(--color-text-faint)' }}>No expenses logged yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Badges Showcase ═══ */}
      <div className="card-static !p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-card-title" style={{ color: 'var(--color-text-secondary)' }}>🏅 Badge Showcase</h3>
          <Link to="/gamification" className="font-label transition-colors" style={{ color: 'var(--color-primary)' }}>
            View all →
          </Link>
        </div>
        {earnedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {earnedBadges.map(b => (
              <div
                key={b.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-label font-bold text-amber-500">{b.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-5xl">🔒</span>
            <p className="font-body mt-4" style={{ color: 'var(--color-text-faint)' }}>No badges earned yet. Keep tracking!</p>
          </div>
        )}
      </div>

      {/* ═══ Level Roadmap ═══ */}
      <div className="card-static !p-6">
        <h3 className="font-card-title mb-6" style={{ color: 'var(--color-text-secondary)' }}>🗺️ Level Roadmap</h3>
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const reached = level.tier >= m.tier;
            const current = level.tier === m.tier;
            return (
              <div
                key={m.tier}
                className="flex items-center gap-5 py-3.5 px-4 rounded-2xl transition-all"
                style={
                  current
                    ? {
                        background: 'var(--mission-complete-bg)',
                        border: `1px solid var(--mission-complete-border)`,
                      }
                    : { border: '1px solid transparent' }
                }
              >
                {/* Status dot / line */}
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-label font-bold tracking-tighter"
                    style={{
                      background: reached ? '#22c55e' : 'var(--profile-roadmap-dot-inactive)',
                      color: reached ? '#fff' : 'var(--color-text-disabled)',
                      boxShadow: current ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
                    }}
                  >
                    {reached ? '✓' : m.tier}
                  </div>
                  {i < milestones.length - 1 && (
                    <div
                      className="w-1 h-6 mt-1.5 rounded-full"
                      style={{ background: reached ? 'rgba(34,197,94,0.3)' : 'var(--profile-roadmap-line)' }}
                    />
                  )}
                </div>

                {/* Info */}
                <span className="text-2xl w-10 text-center">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-card-title" style={{ color: reached ? 'var(--color-text-heading)' : 'var(--color-text-faint)' }}>
                      {m.name}
                    </p>
                    {current && (
                      <span className="font-label font-bold px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-500 uppercase tracking-widest text-[11px]">
                        YOU ARE HERE
                      </span>
                    )}
                  </div>
                  <p className="font-label" style={{ color: 'var(--color-text-faint)' }}>
                    {m.pts.toLocaleString()} pts • {m.unlocks}
                  </p>
                </div>

                {/* Status text */}
                <span className={`font-label shrink-0 font-bold tracking-wide ${reached ? 'text-green-500' : ''}`} style={reached ? {} : { color: 'var(--color-text-disabled)' }}>
                  {reached ? '✅ Done' : `${m.pts - user.points} pts away`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/add"
          className="card text-center !p-8 group"
        >
          <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">➕</span>
          <p className="font-card-title" style={{ color: 'var(--color-text-heading)' }}>Add Transaction</p>
          <p className="font-label mt-2" style={{ color: 'var(--color-text-faint)' }}>Earn +5 XP per entry</p>
        </Link>
        <Link
          to="/gamification"
          className="card text-center !p-8 group"
        >
          <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">🎮</span>
          <p className="font-card-title" style={{ color: 'var(--color-text-heading)' }}>Gamification</p>
          <p className="font-label mt-2" style={{ color: 'var(--color-text-faint)' }}>Badges, wheel & missions</p>
        </Link>
        <Link
          to="/reports"
          className="card text-center !p-8 group"
        >
          <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📈</span>
          <p className="font-card-title" style={{ color: 'var(--color-text-heading)' }}>View Reports</p>
          <p className="font-label mt-2" style={{ color: 'var(--color-text-faint)' }}>Charts & analytics</p>
        </Link>
      </div>
    </div>
  );
}

/* ── Small Components ── */
function QuickStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'var(--profile-quick-stat-bg)' }}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
        <p className="font-body font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card animate-slide-in !p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-label font-bold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      </div>
      <p className="font-card-value truncate" style={{ color }}>{value}</p>
    </div>
  );
}
