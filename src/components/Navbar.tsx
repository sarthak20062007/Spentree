'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import NotificationPanel from './NotificationPanel';
import ProfileModal from './ProfileModal';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/arena', label: 'Arena' },
  { href: '/insights', label: 'Insights' },
  { href: '/vault', label: 'Vault' },
  { href: '/log', label: 'Log' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { notifications, toggleNotifications, toggleProfileModal, profile } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,53,39,0.06)]">
        <div className="flex items-center justify-between px-8 h-16 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-900 font-headline">
              Spentree
            </Link>
            <div className="hidden md:flex items-center gap-8 font-headline text-sm font-semibold tracking-tight">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href
                      ? 'text-emerald-700 border-b-2 border-emerald-700 pb-1'
                      : 'text-slate-500 hover:text-emerald-900 transition-colors'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-emerald-50/50 rounded-lg transition-all active:scale-95 text-emerald-900 relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleProfileModal}
              className="p-2 hover:bg-emerald-50/50 rounded-lg transition-all active:scale-95 text-emerald-900 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-sm font-bold text-primary">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </div>
      </nav>
      <NotificationPanel />
      <ProfileModal />
    </>
  );
}
