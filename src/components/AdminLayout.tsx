'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession, setAdminSession } from '@/lib/store';
import type { AdminSession } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/records', label: 'Records Queue', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/admin/bulk-upload', label: 'Bulk Upload', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
  { href: '/admin/manual-entry', label: 'Manual Entry', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { href: '/admin/audit', label: 'Audit Log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const s = getAdminSession();
    if (!s?.isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    setSession(s);
  }, [router]);

  const handleLogout = () => {
    setAdminSession(null);
    router.push('/admin/login');
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1e3a5f] text-white flex flex-col transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm">GMS Admin</p>
              <p className="text-xs text-blue-300">CSR Module</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                active ? 'bg-white/15 text-white border-r-3 border-amber-400' : 'text-blue-200 hover:bg-white/5 hover:text-white'
              }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 border-t border-white/10 flex items-center gap-3 text-blue-200 hover:text-white transition text-sm">
          <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-[#1e3a5f]">
                {NAV_ITEMS.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Admin Panel'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Public Portal
              </Link>
              {/* Admin Profile Toggle */}
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2 transition">
                  <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{session.name.charAt(0)}</span>
                  </div>
                  {sidebarOpen && (
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-700">{session.name}</p>
                      <p className="text-xs text-slate-500">{session.role}</p>
                    </div>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border z-50 animate-fade-in">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{session.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{session.name}</p>
                          <p className="text-sm text-slate-500">{session.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="px-3 py-2 text-sm text-slate-600">
                        <span className="text-xs text-slate-400">Login ID:</span>
                        <p className="font-mono text-xs">{session.loginId}</p>
                      </div>
                      <div className="px-3 py-2 text-sm text-slate-600">
                        <span className="text-xs text-slate-400">Session Started:</span>
                        <p className="text-xs">{new Date(session.loginTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-3 border-t">
                      <button onClick={handleLogout} className="w-full btn btn-danger text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
