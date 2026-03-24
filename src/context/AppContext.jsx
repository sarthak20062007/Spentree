import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, removeItem } from '../utils/storage';
import { calculateLevel, checkBadgeEligibility, generateDailyMissions, updateMissionProgress } from '../utils/gamification';
import { playCoinSound, playLevelUpSound, playBadgeSound } from '../utils/sounds';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  setDoc,
  getDoc
} from 'firebase/firestore';

const AppContext = createContext(null);

const todayStr = () => new Date().toISOString().split('T')[0];

const DEFAULT_USER = {
  username: '',
  gmail: '',
  points: 0,
  badges: [],
  loginStreak: 0,
  spinCount: 0,
  lastLoginDate: '',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => getItem('spentree_user', null));
  const [transactions, setTransactions] = useState(() => getItem('spentree_transactions', []));
  const [dailyMissions, setDailyMissions] = useState(() => {
    const saved = getItem('spentree_missions', null);
    const savedDate = getItem('spentree_missions_date', '');
    if (saved && savedDate === todayStr()) return saved;
    return generateDailyMissions(todayStr());
  });
  const [notifications, setNotifications] = useState([]);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const prevLevelRef = useRef(user ? calculateLevel(user.points).tier : 0);

  // Sync Transactions from Firebase
  useEffect(() => {
    if (!user?.gmail) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userEmail', '==', user.gmail),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);
    });

    return () => unsubscribe();
  }, [user?.gmail]);

  // Sync User Stats from Firebase
  useEffect(() => {
    if (!user?.gmail) return;

    const userDoc = doc(db, 'users', user.gmail);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUser(prev => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, [user?.gmail]);

  // Persist Local State (Keep as fallback)
  useEffect(() => { 
    if (user) {
      setItem('spentree_user', user);
      // Sync user profile to Firestore whenever it changes locally
      const userRef = doc(db, 'users', user.gmail);
      setDoc(userRef, user, { merge: true });
    }
  }, [user]);

  useEffect(() => {
    setItem('spentree_missions', dailyMissions);
    setItem('spentree_missions_date', todayStr());
  }, [dailyMissions]);

  // Update missions when transactions change
  useEffect(() => {
    setDailyMissions(prev => updateMissionProgress(prev, transactions, todayStr()));
  }, [transactions]);

  // Check for level up
  useEffect(() => {
    if (!user) return;
    const newTier = calculateLevel(user.points).tier;
    if (newTier > prevLevelRef.current && prevLevelRef.current > 0) {
      playLevelUpSound();
      addNotification(`🎉 Level Up! You're now a ${calculateLevel(user.points).name}!`, 'levelup');
    }
    prevLevelRef.current = newTier;
  }, [user?.points]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  }, []);

  const showFloatingPoints = useCallback((pts) => {
    const id = Date.now() + Math.random();
    setFloatingPoints(prev => [...prev, { id, pts }]);
    setTimeout(() => setFloatingPoints(prev => prev.filter(f => f.id !== id)), 1300);
  }, []);

  const addPoints = useCallback((pts) => {
    setUser(prev => {
      const updated = { ...prev, points: prev.points + pts };
      // Check badges
      const state = { ...updated, transactions, spinCount: updated.spinCount };
      const newBadges = checkBadgeEligibility(state);
      if (newBadges.length > 0) {
        updated.badges = [...updated.badges, ...newBadges];
        playBadgeSound();
        newBadges.forEach(bId => {
          const badgeName = bId.replace(/_/g, ' ');
          addNotification(`🏅 Badge Unlocked: ${badgeName}!`, 'badge');
        });
      }
      return updated;
    });
  }, [transactions, addNotification]);

  const addTransaction = useCallback(async (tx) => {
    if (!user?.gmail) return;
    
    const transaction = { 
      ...tx, 
      userEmail: user.gmail,
      createdAt: new Date().toISOString() 
    };

    try {
      await addDoc(collection(db, 'transactions'), transaction);
      playCoinSound();
      addPoints(5);
      showFloatingPoints(5);
      addNotification(`+5 pts for logging ${tx.type}!`, 'success');
    } catch (error) {
      console.error("Error adding transaction: ", error);
      addNotification("Failed to save to cloud", "error");
    }
  }, [user, addPoints, showFloatingPoints, addNotification]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  }, []);

  const completeMission = useCallback((missionId, reward) => {
    addPoints(reward);
    showFloatingPoints(reward);
    addNotification(`🎯 Mission Complete! +${reward} pts`, 'success');
  }, [addPoints, showFloatingPoints, addNotification]);

  const spinWheel = useCallback((prize) => {
    setUser(prev => ({ ...prev, spinCount: prev.spinCount + 1 }));
    addPoints(prize.points);
    showFloatingPoints(prize.points);
    addNotification(`🎰 You won ${prize.label}!`, 'success');
  }, [addPoints, showFloatingPoints, addNotification]);

  const register = useCallback(({ gmail, username, password }) => {
    const existing = getItem('spentree_users', {});
    // Check if gmail already registered
    if (existing[gmail]) return { success: false, message: 'This Gmail is already registered. Please login instead.' };
    // Check if username taken
    const usernameTaken = Object.values(existing).some(u => u.username === username);
    if (usernameTaken) return { success: false, message: 'This username is already taken. Try a different one.' };
    // Save user (keyed by gmail)
    existing[gmail] = { password, ...DEFAULT_USER, username, gmail };
    setItem('spentree_users', existing);
    // Do NOT auto-login — user will be redirected to login page
    return { success: true };
  }, []);

  const login = useCallback((gmail, password) => {
    const users = getItem('spentree_users', {});
    if (!users[gmail]) return { success: false, message: 'No account found with this Gmail. Please register first.' };
    if (users[gmail].password !== password) return { success: false, message: 'Incorrect password. Please try again.' };
    // Load user data
    const username = users[gmail].username;
    const savedUser = getItem(`spentree_user_${gmail}`, { ...DEFAULT_USER, username, gmail });
    // Update streak
    const last = savedUser.lastLoginDate;
    const today = todayStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (last === yesterday) savedUser.loginStreak = (savedUser.loginStreak || 0) + 1;
    else if (last !== today) savedUser.loginStreak = 1;
    savedUser.lastLoginDate = today;
    setUser(savedUser);
    const savedTx = getItem(`spentree_tx_${gmail}`, []);
    setTransactions(savedTx);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    if (user) {
      setItem(`spentree_user_${user.gmail}`, user);
      setItem(`spentree_tx_${user.gmail}`, transactions);
    }
    removeItem('spentree_user');
    removeItem('spentree_transactions');
    setUser(null);
    setTransactions([]);
  }, [user, transactions]);

  // Auto-save per-user on changes
  useEffect(() => {
    if (user?.gmail) {
      setItem(`spentree_user_${user.gmail}`, user);
      setItem(`spentree_tx_${user.gmail}`, transactions);
    }
  }, [user, transactions]);

  const value = {
    user,
    transactions,
    dailyMissions,
    notifications,
    floatingPoints,
    addTransaction,
    deleteTransaction,
    addPoints,
    completeMission,
    spinWheel,
    login,
    register,
    logout,
    addNotification,
    showFloatingPoints,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
