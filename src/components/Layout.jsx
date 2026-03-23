import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Aurora from './animations/Aurora';
import { calculateLevel } from '../utils/gamification';
import Notification from './Notification';
import FloatingPoints from './FloatingPoints';


// Page Title Mapping for Breadcrumb
const getPageTitle = (pathname) => {
  const path = pathname.split('/')[1];
  if (!path) return 'Dashboard';
  switch (path) {
    case 'dashboard': return 'Dashboard';
    case 'add': return 'Add Transaction';
    case 'transactions': return 'Transactions';
    case 'gamification': return 'Gamification';
    case 'reports': return 'Reports';
    case 'profile': return 'My Profile';
    default: return 'Dashboard';
  }
};

// Professional UI Icons as SVGs
const Icons = {
  Dashboard: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Add: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Transactions: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Gamification: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Reports: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Profile: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: (
    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  LogoTree: (
    <svg className="w-7 h-7 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Bell: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Close: (
    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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

  const level = calculateLevel(user.points);

  return (
    <div className="flex min-h-screen relative" style={{ background: '#0d1117' }}>
      {/* Global Aurora Background */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF9484", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.0}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════ BANKING SIDEBAR ═══════════════ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'rgba(13, 17, 23, 0.7)',
          backdropFilter: 'blur(16px)',
          color: '#e6edf3',
          boxShadow: 'none',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#58a6ff]/10 flex items-center justify-center border border-[#58a6ff]/30 text-[#58a6ff]">
            {Icons.LogoTree}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#e6edf3] leading-none">Spentree</h1>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#8b949e] mt-1">Finance</p>
          </div>
          <button 
            className="lg:hidden ml-auto p-2 text-[#8b949e] hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            {Icons.Close}
          </button>
        </div>

        <div className="h-px mx-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 px-4 py-3 rounded-lg font-nav font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-[#58a6ff] border-l-4 border-[#58a6ff]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-colors duration-200 ${isActive ? 'text-[#58a6ff]' : 'text-white/50'}`}>
                    {item.icon}
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ─── Bottom Section: Profile & Logout ─── */}
        <div className="h-px mx-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="p-4 mt-auto flex flex-col gap-[10px]">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-white font-bold shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-bold text-[#e6edf3] truncate leading-tight">{user.username}</p>
              <p className="text-[11px] text-[#8b949e] uppercase tracking-widest mt-0.5">Tier {level.tier}</p>
            </div>
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body font-medium text-white/50 hover:text-white hover:bg-red-500/20 border border-transparent transition-all duration-200 shrink-0"
          >
            {Icons.Logout}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        
        <header 
          className="sticky top-0 z-30 w-full flex items-center justify-between px-6 lg:px-10 shrink-0"
          style={{ height: '70px', background: 'rgba(13, 17, 23, 0.5)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Left Side: Mobile Menu & Breadcrumb */}
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              aria-label="Open menu"
            >
              {Icons.Menu}
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-nav">
              <span className="hidden sm:inline text-white/50 font-medium">Pages</span>
              <span className="hidden sm:inline text-white/50">/</span>
              <h2 className="font-page-title text-lg text-white capitalize">{getPageTitle(location.pathname)}</h2>
            </div>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-3 lg:gap-5">
            <button className="relative p-2 text-[#58a6ff] hover:text-[#58a6ff]/80 transition-colors rounded-full hover:bg-[#1c2128] hidden sm:block">
              {Icons.Bell}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0d1117]"></span>
            </button>
            
            <div className="hidden sm:block w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
            
            <div className="flex items-center gap-3">
              <span className="hidden md:block font-body font-medium text-[#e6edf3]">{user.username}</span>
              <div className="w-9 h-9 rounded-full bg-[#1f6feb] flex items-center justify-center text-white font-bold shrink-0 border-2 border-[#21262d]">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 lg:pt-6 lg:pb-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global overlays */}
      <Notification />
      <FloatingPoints />
    </div>
  );
}
