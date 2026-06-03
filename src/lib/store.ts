import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  merchant: string;
  date: string;
  tags: string[];
  xpEarned: number;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  icon: string;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  color: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  xpReward: number;
  completed: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'xp';
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinDate: string;
}

export interface BattleLog {
  id: string;
  time: string;
  type: string;
  typeColor: string;
  message: string;
}

export interface AppState {
  // User
  profile: UserProfile;
  xp: number;
  level: number;
  streak: number;
  totalBalance: number;

  // Data
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  quests: Quest[];
  notifications: Notification[];
  battleLogs: BattleLog[];

  // Arena
  userCapitalHP: number;
  aiCapitalHP: number;
  userResilience: number;
  aiBenchmark: number;
  buffsUsed: string[];

  // UI State
  activeTimePeriod: '1M' | '6M' | '1Y';
  showProfileModal: boolean;
  showNotifications: boolean;

  // Auth
  isAuthenticated: boolean;
  registeredUsers: any[];

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'xpEarned' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeSavings: (id: string, amount: number) => void;
  completeQuest: (id: string) => void;
  addNotification: (msg: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setTimePeriod: (period: '1M' | '6M' | '1Y') => void;
  toggleProfileModal: () => void;
  toggleNotifications: () => void;
  useBuff: (buffName: string) => void;
  addBattleLog: (log: Omit<BattleLog, 'id'>) => void;
  resetStreak: () => void;
  exportCSV: () => string;
  resetApp: () => void;
  login: (email: string, password: string) => boolean;
  signup: (email: string, name: string, password: string) => boolean;
  logout: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const calcLevel = (xp: number) => Math.floor(xp / 1000) + 1;

const LEVEL_TITLES: Record<number, string> = {
  1: 'Seedling', 5: 'Sapling', 10: 'Young Oak',
  15: 'Forest Guardian', 20: 'Wealth Ranger',
  25: 'Capital Knight', 30: 'Money Mage',
  35: 'Fiscal Sage', 40: 'Wealth Commander',
  45: 'Treasury Monarch', 50: 'Legendary Naturalist',
};

export const getLevelTitle = (level: number): string => {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_TITLES[k];
  }
  return 'Seedling';
};

const initialBudgets: Budget[] = [
  { id: '1', category: 'Food & Dining', icon: 'restaurant', limit: 15000, spent: 0 },
  { id: '2', category: 'Rent & Utilities', icon: 'home', limit: 25000, spent: 0 },
  { id: '3', category: 'Transport', icon: 'directions_car', limit: 5000, spent: 0 },
  { id: '4', category: 'Leisure', icon: 'confirmation_number', limit: 8000, spent: 0 },
];

const initialQuests: Quest[] = [
  { id: '1', title: 'No-Spend Day', description: 'Go a full day without spending', progress: 0, total: 1, xpReward: 500, completed: false },
  { id: '2', title: 'Budget Master', description: 'Stay under budget in all categories', progress: 0, total: 4, xpReward: 1000, completed: false },
  { id: '3', title: 'Savings Sprint', description: 'Contribute ₹5,000 to any savings goal', progress: 0, total: 5000, xpReward: 750, completed: false },
  { id: '4', title: 'Log Streak', description: 'Log transactions for 7 consecutive days', progress: 0, total: 7, xpReward: 1500, completed: false },
];

const initialSavingsGoals: SavingsGoal[] = [
  { id: '1', title: 'Emergency Fund', description: 'Protecting your future', current: 0, target: 500000, color: 'text-secondary' },
  { id: '2', title: 'Vacation Fund', description: 'Dream holiday trip', current: 0, target: 200000, color: 'text-primary-container' },
];

const initialBattleLogs: BattleLog[] = [
  { id: '1', time: '14:22:01', type: 'SYSTEM:', typeColor: 'text-secondary', message: 'User capital increased by +₹1,240 (Direct Deposit detected).' },
  { id: '2', time: '14:22:05', type: 'AI_TACTIC:', typeColor: 'text-on-tertiary-container font-bold', message: 'Benchmark AI executed market rebalance. Portfolio gap widening.' },
  { id: '3', time: '14:23:12', type: 'ALERT:', typeColor: 'text-amber-600', message: 'Spending drift detected in "Dining" category. -2% Efficiency.' },
  { id: '4', time: '14:25:44', type: 'BUFF_READY:', typeColor: 'text-secondary', message: 'Savings Raid maneuver available. Potential ROI: 4.5%.' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      profile: {
        name: 'Commander',
        email: 'commander@spentree.app',
        avatar: '',
        role: 'Wealth Commander',
        joinDate: '2024-01-15',
      },
      xp: 0,
      level: 1,
      streak: 0,
      totalBalance: 0,

      // Data
      transactions: [],
      budgets: initialBudgets,
      savingsGoals: initialSavingsGoals,
      quests: initialQuests,
      notifications: [],
      battleLogs: initialBattleLogs,

      // Arena
      userCapitalHP: 0,
      aiCapitalHP: 1512000,
      userResilience: 82,
      aiBenchmark: 91,
      buffsUsed: [],

      // UI
      activeTimePeriod: '6M',
      showProfileModal: false,
      showNotifications: false,

      // Auth
      isAuthenticated: false,
      registeredUsers: [],

      // Actions
      addTransaction: (tx) => {
        const state = get();
        const xpEarned = tx.type === 'expense' ? 50 : 100;
        const newTx: Transaction = {
          ...tx,
          id: generateId(),
          xpEarned,
          createdAt: new Date().toISOString(),
        };

        // Update budget spent
        const updatedBudgets = state.budgets.map(b => {
          if (tx.type === 'expense' && b.category.toLowerCase().includes(tx.category.toLowerCase())) {
            return { ...b, spent: b.spent + tx.amount };
          }
          return b;
        });

        // Update balance
        const balanceChange = tx.type === 'income' ? tx.amount : -tx.amount;
        const newBalance = state.totalBalance + balanceChange;
        const newXp = state.xp + xpEarned;

        // Check quest progress
        const updatedQuests = state.quests.map(q => {
          if (q.id === '4' && !q.completed) {
            const newProgress = Math.min(q.progress + 1, q.total);
            return { ...q, progress: newProgress, completed: newProgress >= q.total };
          }
          return q;
        });

        set({
          transactions: [newTx, ...state.transactions],
          budgets: updatedBudgets,
          totalBalance: newBalance,
          xp: newXp,
          level: calcLevel(newXp),
          quests: updatedQuests,
          userCapitalHP: newBalance > 0 ? newBalance : 0,
          userResilience: Math.min(99, Math.max(1, Math.round((newBalance / state.aiCapitalHP) * 100))),
        });

        get().addNotification(`+${xpEarned} XP earned for logging a transaction!`, 'xp');

        // Add battle log
        get().addBattleLog({
          time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'SYSTEM:',
          typeColor: 'text-secondary',
          message: `User ${tx.type === 'expense' ? 'spent' : 'received'} ₹${tx.amount.toLocaleString('en-IN')} (${tx.merchant || tx.category}).`,
        });
      },

      deleteTransaction: (id) => {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }));
      },

      updateBudget: (id, updates) => {
        set(state => ({
          budgets: state.budgets.map(b =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      addSavingsGoal: (goal) => {
        set(state => ({
          savingsGoals: [...state.savingsGoals, { ...goal, id: generateId() }],
        }));
        get().addNotification('New savings goal created!', 'success');
      },

      updateSavingsGoal: (id, updates) => {
        set(state => ({
          savingsGoals: state.savingsGoals.map(g =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      deleteSavingsGoal: (id) => {
        set(state => ({
          savingsGoals: state.savingsGoals.filter(g => g.id !== id),
        }));
      },

      contributeSavings: (id, amount) => {
        const state = get();
        if (state.totalBalance < amount) {
          get().addNotification('Insufficient balance for contribution!', 'warning');
          return;
        }

        const updatedGoals = state.savingsGoals.map(g => {
          if (g.id === id) {
            const newCurrent = Math.min(g.current + amount, g.target);
            return { ...g, current: newCurrent };
          }
          return g;
        });

        const newXp = state.xp + 200;

        // Update quest progress for savings sprint
        const updatedQuests = state.quests.map(q => {
          if (q.id === '3' && !q.completed) {
            const newProgress = Math.min(q.progress + amount, q.total);
            return { ...q, progress: newProgress, completed: newProgress >= q.total };
          }
          return q;
        });

        set({
          savingsGoals: updatedGoals,
          totalBalance: state.totalBalance - amount,
          xp: newXp,
          level: calcLevel(newXp),
          quests: updatedQuests,
        });

        get().addNotification(`+200 XP! Contributed ₹${amount.toLocaleString('en-IN')} to savings!`, 'xp');
      },

      completeQuest: (id) => {
        const state = get();
        const quest = state.quests.find(q => q.id === id);
        if (!quest || !quest.completed) return;

        const newXp = state.xp + quest.xpReward;
        set({
          quests: state.quests.map(q =>
            q.id === id ? { ...q, completed: true } : q
          ),
          xp: newXp,
          level: calcLevel(newXp),
        });
        get().addNotification(`🏆 Quest "${quest.title}" completed! +${quest.xpReward} XP`, 'success');
      },

      addNotification: (message, type) => {
        set(state => ({
          notifications: [{
            id: generateId(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false,
          }, ...state.notifications].slice(0, 50),
        }));
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      updateProfile: (updates) => {
        set(state => ({
          profile: { ...state.profile, ...updates },
        }));
        get().addNotification('Profile updated successfully!', 'success');
      },

      setTimePeriod: (period) => {
        set({ activeTimePeriod: period });
      },

      toggleProfileModal: () => {
        set(state => ({ showProfileModal: !state.showProfileModal }));
      },

      toggleNotifications: () => {
        set(state => ({ showNotifications: !state.showNotifications }));
      },

      useBuff: (buffName) => {
        const state = get();
        if (state.buffsUsed.includes(buffName)) {
          get().addNotification(`${buffName} already activated this session!`, 'warning');
          return;
        }

        let resilienceBoost = 0;
        let xpGain = 300;
        let logMsg = '';

        switch (buffName) {
          case 'Boost Shield':
            resilienceBoost = 5;
            logMsg = 'Boost Shield activated. Savings protected from impulsive drift. +5% Resilience.';
            break;
          case 'Yield Burst':
            resilienceBoost = 3;
            logMsg = 'Yield Burst deployed. Idle cash auto-moved to high-yield account.';
            break;
          case 'Savings Raid':
            resilienceBoost = 4;
            logMsg = 'Savings Raid executed. High-interest debt cleared instantly.';
            break;
          case 'Diversify Zap':
            resilienceBoost = 6;
            logMsg = 'Diversify Zap engaged. Portfolio rebalanced for optimal growth.';
            break;
        }

        const newXp = state.xp + xpGain;
        set({
          buffsUsed: [...state.buffsUsed, buffName],
          userResilience: Math.min(99, state.userResilience + resilienceBoost),
          xp: newXp,
          level: calcLevel(newXp),
        });

        get().addNotification(`⚡ ${buffName} activated! +${xpGain} XP`, 'xp');
        get().addBattleLog({
          time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'BUFF_ACTIVE:',
          typeColor: 'text-secondary',
          message: logMsg,
        });
      },

      addBattleLog: (log) => {
        set(state => ({
          battleLogs: [{ ...log, id: generateId() }, ...state.battleLogs].slice(0, 20),
        }));
      },

      resetStreak: () => {
        set({ streak: 0 });
      },

      exportCSV: () => {
        const state = get();
        const headers = 'Date,Type,Category,Merchant,Amount,Tags\n';
        const rows = state.transactions.map(t =>
          `${t.date},${t.type},${t.category},${t.merchant},${t.amount},"${t.tags.join(', ')}"`
        ).join('\n');
        return headers + rows;
      },

      resetApp: () => {
        set({
          totalBalance: 0,
          xp: 0,
          level: 1,
          streak: 0,
          transactions: [],
          budgets: initialBudgets,
          savingsGoals: initialSavingsGoals,
          quests: initialQuests,
          battleLogs: [],
          userCapitalHP: 0,
          userResilience: 82,
          buffsUsed: [],
        });
        get().addNotification('All data reset! Fresh start.', 'success');
      },

      login: (email, password) => {
        const state = get();
        const user = state.registeredUsers.find(u => u.email === email && u.password === password);
        if (user) {
          set({
            isAuthenticated: true,
            profile: {
              ...state.profile,
              name: user.name,
              email: user.email,
            }
          });
          get().addNotification('Logged in successfully!', 'success');
          return true;
        }
        get().addNotification('Invalid email or password.', 'warning');
        return false;
      },

      signup: (email, name, password) => {
        const state = get();
        if (state.registeredUsers.some(u => u.email === email)) {
          get().addNotification('Email already in use.', 'warning');
          return false;
        }

        const newUser = { email, name, password };
        set({
          registeredUsers: [...state.registeredUsers, newUser],
          isAuthenticated: true,
          profile: {
            ...state.profile,
            name: name,
            email: email,
            joinDate: new Date().toISOString().split('T')[0],
          }
        });
        get().addNotification('Account created successfully!', 'success');
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false });
        get().addNotification('Logged out successfully.', 'info');
      },
    }),
    {
      name: 'spentree-storage',
    }
  )
);
