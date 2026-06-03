'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, signup, addNotification } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      if (!email || !password) {
        addNotification('Please fill in all fields.', 'warning');
        return;
      }
      const success = login(email, password);
      if (success) {
        router.push('/');
      }
    } else {
      if (!email || !username || !password || !confirmPassword) {
        addNotification('Please fill in all fields.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        addNotification('Passwords do not match.', 'warning');
        return;
      }
      const success = signup(email, username, password);
      if (success) {
        router.push('/');
      }
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-[0_20px_40px_rgba(0,53,39,0.1)] w-full max-w-md relative z-10 border border-outline-variant/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-container rounded-2xl mx-auto mb-6 flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isLogin ? 'login' : 'person_add'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Join Spentree'}
          </h1>
          <p className="text-outline font-medium text-sm">
            {isLogin ? 'Enter your credentials to continue your journey.' : 'Create an account to start your financial conquest.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="text-xs font-bold tracking-widest text-outline uppercase mb-2 block">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50 font-medium"
                placeholder="commander@spentree.app"
              />
            </div>
          </div>

          {/* Username (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-bold tracking-widest text-outline uppercase mb-2 block">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50 font-medium"
                  placeholder="Commander"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="text-xs font-bold tracking-widest text-outline uppercase mb-2 block">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-bold tracking-widest text-outline uppercase mb-2 block">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">lock_reset</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold font-headline text-lg hover:bg-primary-fixed hover:text-on-primary-fixed transition-all shadow-[0_10px_20px_rgba(0,108,73,0.2)] hover:shadow-[0_15px_30px_rgba(0,108,73,0.3)] hover:-translate-y-1 mt-2 flex items-center justify-center gap-2"
          >
            {isLogin ? 'Enter' : 'Initialize'}
            <span className="material-symbols-outlined text-xl">
              arrow_forward
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-outline text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already a commander?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setUsername('');
              }}
              className="text-secondary font-bold hover:underline transition-all"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
