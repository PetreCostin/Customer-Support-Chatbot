'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, HelpCircle, Ticket, Users, LogOut, MessageSquare } from 'lucide-react';
import { getUser, getToken, clearAuth } from '@/lib/auth';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  useEffect(() => {
    const token = getToken();
    if (!token || user?.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [router, user]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-400" />
            <span className="font-semibold">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
                pathname === item.href ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <Link href="/chat" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm">
            <MessageSquare className="w-4 h-4" />
            Back to Chat
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 truncate max-w-[100px]">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
