'use client';

import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If not authenticated and trying to access a protected page, redirect to login
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Prevent flash of protected content before redirect
  if (!mounted) return null;

  // If not authenticated and not on login page, render nothing while redirecting
  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
