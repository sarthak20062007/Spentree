/* Pure gamification logic functions */
export const todayStr = () => new Date().toISOString().split('T')[0];

// ========== Levels ==========
const LEVELS = [
  { name: 'Seedling',     tier: 1, minPoints: 0,    maxPoints: 49,   emoji: '🌱', treeEmoji: '🌱' },
  { name: 'Sprout',       tier: 2, minPoints: 50,   maxPoints: 149,  emoji: '🌿', treeEmoji: '🌿' },
  { name: 'Sapling',      tier: 3, minPoints: 150,  maxPoints: 349,  emoji: '🪴', treeEmoji: '🪴' },
  { name: 'Young Tree',   tier: 4, minPoints: 350,  maxPoints: 599,  emoji: '🌳', treeEmoji: '🌲' },
  { name: 'Mature Tree',  tier: 5, minPoints: 600,  maxPoints: 999,  emoji: '🌳', treeEmoji: '🌳' },
  { name: 'Grand Oak',    tier: 6, minPoints: 1000, maxPoints: 1999, emoji: '🏔️', treeEmoji: '🌴' },
  { name: 'Ancient Grove',tier: 7, minPoints: 2000, maxPoints: 4999, emoji: '✨', treeEmoji: '🎄' },
  { name: 'World Tree',   tier: 8, minPoints: 5000, maxPoints: Infinity, emoji: '👑', treeEmoji: '🎋' },
];

export function calculateLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return { ...LEVELS[i] };
  }
  return { ...LEVELS[0] };
}

export function getNextLevel(points) {
  const current = calculateLevel(points);
  const idx = LEVELS.findIndex(l => l.name === current.name);
  if (idx < LEVELS.length - 1) return { ...LEVELS[idx + 1] };
  return null;
}

export function getLevelProgress(points) {
  const current = calculateLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ========== Badges ==========
const BADGES = [
  { id: 'first_expense',    name: 'First Step',       icon: '👣', desc: 'Log your first expense',       condition: s => s.transactions.filter(t => t.type === 'expense').length >= 1 },
  { id: 'five_expenses',    name: 'Getting Going',     icon: '🚀', desc: 'Log 5 expenses',                condition: s => s.transactions.filter(t => t.type === 'expense').length >= 5 },
  { id: 'ten_transactions', name: 'Dedicated Tracker', icon: '📊', desc: 'Log 10 transactions',           condition: s => s.transactions.length >= 10 },
  { id: 'first_income',     name: 'Money Maker',       icon: '💰', desc: 'Log your first income',         condition: s => s.transactions.filter(t => t.type === 'income').length >= 1 },
  { id: 'level_3',          name: 'Rising Star',       icon: '⭐', desc: 'Reach Level 3 (Sapling)',       condition: s => calculateLevel(s.points).tier >= 3 },
  { id: 'level_5',          name: 'Tree Master',       icon: '🌳', desc: 'Reach Level 5 (Mature Tree)',   condition: s => calculateLevel(s.points).tier >= 5 },
  { id: 'saver',            name: 'Smart Saver',       icon: '🐷', desc: 'Have positive savings',         condition: s => { const inc = s.transactions.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0); const exp = s.transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0); return inc > exp && inc > 0; } },
  { id: 'spinner',          name: 'Lucky Spinner',     icon: '🎰', desc: 'Spin the wheel for the first time', condition: s => s.spinCount >= 1 },
];

export function getAllBadges() { return BADGES.map(b => ({ ...b })); }

export function checkBadgeEligibility(state) {
  const earned = state.badges || [];
  return BADGES.filter(b => !earned.includes(b.id) && b.condition(state)).map(b => b.id);
}

// ========== Daily Missions ==========
const MISSION_TEMPLATES = [
  { id: 'log_expense',     title: 'Log an Expense',      target: 1, reward: 10, type: 'expense_count' },
  { id: 'log_income',      title: 'Log an Income',        target: 1, reward: 10, type: 'income_count' },
  { id: 'log_3_trans',     title: 'Log 3 Transactions',   target: 3, reward: 20, type: 'transaction_count' },
  { id: 'save_money',      title: 'Stay Under Budget',    target: 1, reward: 15, type: 'budget_check' },
  { id: 'log_food',        title: 'Track Food Spending',  target: 1, reward: 10, type: 'category_food' },
  { id: 'log_5_trans',     title: 'Log 5 Transactions',   target: 5, reward: 30, type: 'transaction_count' },
];

export function generateDailyMissions(dateStr) {
  // Seed from date string to get consistent daily missions
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i) * (i + 1);
  const shuffled = [...MISSION_TEMPLATES].sort((a, b) => {
    const ha = (seed * 31 + a.id.charCodeAt(0)) % 100;
    const hb = (seed * 31 + b.id.charCodeAt(0)) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 3).map(m => ({ ...m, progress: 0, completed: false }));
}

export function updateMissionProgress(missions, transactions, todayStr) {
  const todayTrans = transactions.filter(t => t.date === todayStr);
  return missions.map(m => {
    let progress = 0;
    switch (m.type) {
      case 'expense_count': progress = todayTrans.filter(t => t.type === 'expense').length; break;
      case 'income_count': progress = todayTrans.filter(t => t.type === 'income').length; break;
      case 'transaction_count': progress = todayTrans.length; break;
      case 'category_food': progress = todayTrans.filter(t => t.category === 'Food').length; break;
      case 'budget_check': progress = todayTrans.filter(t => t.type === 'expense').reduce((a,t) => a + t.amount, 0) <= 500 ? 1 : 0; break;
      default: progress = 0;
    }
    const completed = progress >= m.target;
    return { ...m, progress: Math.min(progress, m.target), completed };
  });
}

// ========== Leaderboard ==========
const FAKE_USERS = [
  { username: 'SavvySara',    points: 0, level: '' },
  { username: 'BudgetBoss',   points: 0, level: '' },
  { username: 'CoinCollector', points: 0, level: '' },
  { username: 'ThriftKing',   points: 0, level: '' },
];

export function getLeaderboard(currentUser) {
  // Generate fake user points based on current user's points to keep it competitive
  const base = currentUser.points || 0;
  const fakes = FAKE_USERS.map((u, i) => {
    const pts = Math.max(0, Math.round(base * (0.6 + Math.random() * 0.8) + (i * 15)));
    const lvl = calculateLevel(pts);
    return { username: u.username, points: pts, level: lvl.name, emoji: lvl.emoji, isCurrentUser: false };
  });
  const userLvl = calculateLevel(currentUser.points);
  const me = { username: currentUser.username, points: currentUser.points, level: userLvl.name, emoji: userLvl.emoji, isCurrentUser: true };
  return [...fakes, me].sort((a, b) => b.points - a.points);
}

// ========== Spin Wheel ==========
export const SPIN_PRIZES = [
  { label: '+10 pts', points: 10, color: '#22c55e' },
  { label: '+5 pts',  points: 5,  color: '#3b82f6' },
  { label: '+20 pts', points: 20, color: '#f59e0b' },
  { label: '+2 pts',  points: 2,  color: '#8b5cf6' },
  { label: '+15 pts', points: 15, color: '#ec4899' },
  { label: '+8 pts',  points: 8,  color: '#06b6d4' },
  { label: '+25 pts', points: 25, color: '#ef4444' },
  { label: '+3 pts',  points: 3,  color: '#10b981' },
];

export function getRandomPrize() {
  return SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)];
}

// ========== Categories ==========
export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

export const CATEGORY_COLORS = {
  Food: '#22c55e',
  Travel: '#3b82f6',
  Shopping: '#f59e0b',
  Entertainment: '#ec4899',
  Health: '#ef4444',
  Education: '#8b5cf6',
  Other: '#64748b',
};

export const CATEGORY_ICONS = {
  Food: '🍔',
  Travel: '✈️',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Health: '💊',
  Education: '📚',
  Other: '📦',
};
