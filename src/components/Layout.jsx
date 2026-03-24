import { useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuroraBackground from './animations/AuroraBackground';
import { calculateLevel } from '../utils/gamification';
import Notification from './Notification';
import FloatingPoints from './FloatingPoints';
import { motion, AnimatePresence } from 'framer-motion';

// Page Title Mapping
const getPageTitle = (pathname) => {
  const path = pathname.split('/')[1];
  if (!path) return 'Dashboard';
  switch (path) {
    case 'dashboard': return 'Dashboard';
    case 'add': return 'Add Transaction';
    case 'transactions': return 'Transactions';
    case 'gamification': return 'Quest & Rank';
    case 'reports': return 'Financial Reports';
    case 'profile': return 'My Profile';
    default: return 'Dashboard';
  }
};

const Icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Add: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Transactions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Gamification: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Reports: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
};

const NAV_ITEMS = [
  { to: '/dashboard',    icon: Icons.Dashboard,    label: 'Dashboard' },
  { to: '/add',          icon: Icons.Add,          label: 'Add Transaction' },
  { to: '/transactions', icon: Icons.Transactions, label: 'Transactions' },
  { to: '/gamification', icon: Icons.Gamification, label: 'Gamification' },
  { to: '/reports',      icon: Icons.Reports,      label: 'Reports' },
  { to: '/profile',      icon: Icons.Profile,      label: 'My Profile' },
];

export default function Layout() {
  const { user, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const level = calculateLevel(user.points || 0);

  return (
    <AuroraBackground>
      <div className="flex min-h-screen relative z-10 w-full overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* --- Sidebar --- */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-[280px] bg-black/40 backdrop-blur-2xl border-r border-white/10`}
        >
          <div className="p-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
               <span className="text-xl">🌳</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white italic">Spentree</h1>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-6 mt-auto space-y-4">
             <div className="bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.username}</p>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">{level.name}</p>
                </div>
             </div>
             <button
               onClick={logout}
               className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold border border-white/5"
             >
               {Icons.Logout}
               <span>Sign Out</span>
             </button>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
           <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-white/60">
                  {Icons.Menu}
                </button>
                <div className="flex items-center gap-2 text-white/40 font-medium">
                  <span className="hidden sm:inline">Main</span>
                  <span className="hidden sm:inline">/</span>
                  <h2 className="text-lg text-white font-bold">{getPageTitle(location.pathname)}</h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <button className="p-2 text-white/60 hover:text-white relative bg-white/5 rounded-xl border border-white/10">
                   {Icons.Bell}
                   <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                 </button>
                 <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block"></div>
                 <div className="flex items-center gap-3">
                   <p className="text-sm font-bold text-white hidden md:block">{user.username}</p>
                   <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-white">
                      {user.username?.charAt(0).toUpperCase()}
                   </div>
                 </div>
              </div>
           </header>

           <main className="p-6 pb-24">
              <Outlet />
           </main>
        </div>

        <Notification />
        <FloatingPoints />
      </div>
    </AuroraBackground>
  );
}
