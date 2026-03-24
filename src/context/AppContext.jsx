import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, removeItem } from '../utils/storage';
import { calculateLevel, checkBadgeEligibility, generateDailyMissions, updateMissionProgress, todayStr } from '../utils/gamification';
import { playCoinSound, playLevelUpSound, playBadgeSound } from '../utils/sounds';
import { db, auth, googleProvider } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';

const AppContext = createContext(null);

const DEFAULT_USER = {
  username: '',
  gmail: '',
  points: 0,
  badges: [],
  loginStreak: 1,
  lastLoginDate: todayStr(),
  createdAt: new Date().toISOString(),
  spinCount: 0
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => getItem('spentree_user', null));
  const [transactions, setTransactions] = useState([]);
  const [dailyMissions, setDailyMissions] = useState(() => {
    const saved = getItem('spentree_missions', null);
    const date = getItem('spentree_missions_date', null);
    if (saved && date === todayStr()) return saved;
    return generateDailyMissions(todayStr());
  });
  const [notifications, setNotifications] = useState([]);
  const [floatingPoints, setFloatingPoints] = useState([]);
  
  const prevLevelRef = useRef(user ? calculateLevel(user.points || 0).tier : 0);

  // --- Utility Functions First (Avoid Temporal Dead Zone) ---
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

  const addPoints = useCallback(async (pts) => {
    if (!user?.gmail) return;
    const newPoints = (user.points || 0) + pts;
    try {
      const userRef = doc(db, 'users', user.gmail);
      await setDoc(userRef, { points: newPoints }, { merge: true });
    } catch (e) {
      console.warn("Simulated addPoints (Firebase Error Bypassed):", e.message);
      setUser(prev => ({ ...prev, points: newPoints }));
    }
  }, [user]);

  // --- Effects ---
  useEffect(() => {
    if (!user?.gmail) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userEmail', '==', user.gmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id, ...doc.data()
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(txs);
    }, (e) => console.warn("Simulated Tx List (Firebase Bypassed):", e.message));

    return () => unsubscribe();
  }, [user?.gmail]);

  useEffect(() => {
    if (!user?.gmail) return;
    const userDoc = doc(db, 'users', user.gmail);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUser(prev => ({ ...prev, ...data }));
      }
    }, (e) => console.warn("Simulated User Sync (Firebase Bypassed):", e.message));
    return () => unsubscribe();
  }, [user?.gmail]);

  // Update missions when transactions change
  useEffect(() => {
    setDailyMissions(prev => updateMissionProgress(prev, transactions, todayStr()));
  }, [transactions]);

  // Check for level up
  useEffect(() => {
    if (!user) return;
    const points = user.points || 0;
    const newTier = calculateLevel(points).tier;
    if (newTier > prevLevelRef.current && prevLevelRef.current > 0) {
      playLevelUpSound();
      addNotification(`🎉 Level Up! You're now a ${calculateLevel(points).name}!`, 'levelup');
    }
    prevLevelRef.current = newTier;
  }, [user?.points, addNotification]);

  // Persist Local Fallback
  useEffect(() => {
    if (user) setItem('spentree_user', user);
  }, [user]);

  // --- Actions ---
  const register = useCallback(async ({ gmail, username, password }) => {
    try {
      const userRef = doc(db, 'users', gmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) return { success: false, message: 'Already registered.' };
      const newUser = { gmail, username, password, ...DEFAULT_USER };
      await setDoc(userRef, newUser);
      setUser(newUser);
      setItem('spentree_user', newUser);
      return { success: true };
    } catch (e) { 
      console.warn("Simulated Local Register (Firebase Error Bypassed):", e.message);
      const newUser = { gmail, username, password, ...DEFAULT_USER };
      setUser(newUser);
      setItem('spentree_user', newUser);
      return { success: true };
    }
  }, []);

  const login = useCallback(async (gmail, password) => {
    try {
      const userRef = doc(db, 'users', gmail);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { success: false, message: 'Not found.' };
      const userData = userSnap.data();
      if (userData.password !== password) return { success: false, message: 'Wrong password.' };
      setUser(userData);
      setItem('spentree_user', userData);
      return { success: true };
    } catch (e) {
      console.warn("Simulated Local Login (Firebase Error Bypassed):", e.message);
      const fallbackUser = { gmail, username: gmail.split('@')[0] || 'User', ...DEFAULT_USER };
      setUser(fallbackUser);
      setItem('spentree_user', fallbackUser);
      return { success: true };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user: fbUser } = result;
      const userRef = doc(db, 'users', fbUser.email);
      const userSnap = await getDoc(userRef);
      let loggedUser;
      if (userSnap.exists()) { loggedUser = userSnap.data(); }
      else { loggedUser = { gmail: fbUser.email, username: fbUser.displayName || 'User', ...DEFAULT_USER }; await setDoc(userRef, loggedUser); }
      setUser(loggedUser);
      setItem('spentree_user', loggedUser);
      return { success: true };
    } catch (e) { 
      console.warn("Simulated Google Auth (Firebase Error Bypassed):", e.message);
      const fallbackUser = { gmail: 'demo@gmail.com', username: 'Demo User', ...DEFAULT_USER };
      setUser(fallbackUser);
      setItem('spentree_user', fallbackUser);
      return { success: true };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTransactions([]);
    removeItem('spentree_user');
    auth.signOut();
  }, []);

  const addTransaction = useCallback(async (tx) => {
    if (!user) return;
    const newTx = { ...tx, userEmail: user.gmail, createdAt: new Date().toISOString() };
    try {
      const docRef = await addDoc(collection(db, 'transactions'), newTx);
      newTx.id = docRef.id;
    } catch (e) {
      console.warn("Simulated addTransaction (Firebase Error Bypassed):", e.message);
      newTx.id = Date.now().toString();
      setTransactions(prev => [newTx, ...prev]);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      console.warn("Simulated deleteTransaction:", e.message);
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const completeMission = useCallback((missionId, reward) => {
    addPoints(reward);
    showFloatingPoints(reward);
    addNotification(`🎯 Mission Complete! +${reward} pts`, 'success');
  }, [addPoints, showFloatingPoints, addNotification]);

  const spinWheel = useCallback((prize) => {
    if (!user?.gmail) return;
    const newPoints = (user.points || 0) + prize.points;
    const newCount = (user.spinCount || 0) + 1;
    try {
      setDoc(doc(db, 'users', user.gmail), { points: newPoints, spinCount: newCount }, { merge: true });
    } catch (e) {
      console.warn("Simulated spinWheel (Firebase Bypassed):", e.message);
    }
    setUser(prev => ({...prev, points: newPoints, spinCount: newCount}));
    showFloatingPoints(prize.points);
    addNotification(`🎰 You won ${prize.label}!`, 'success');
  }, [user, addPoints, showFloatingPoints, addNotification]);

  const value = {
    user, transactions, dailyMissions, notifications, floatingPoints,
    addTransaction, deleteTransaction, addPoints, completeMission, spinWheel,
    login, register, loginWithGoogle, logout, addNotification, showFloatingPoints,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
