import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    Settings,
    LogOut,
    Menu,
    X,
    CheckCircle2
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({});
    const [mounted, setMounted] = useState(false);

    // Exclude layout for auth pages
    const isAuthPage = ['/login', '/signup', '/404'].includes(router.pathname);

    useEffect(() => {
        setMounted(true);
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(u);
        } catch { }
    }, []);

    if (isAuthPage) {
        return <>{children}</>;
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        // Placeholder for future settings page
        // { href: '/settings', label: 'Settings', icon: Settings }, 
    ];

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-base-300 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sidebar-gradient text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col backdrop-blur-sm bg-black/10">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8 border-b border-white/10">
                        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
                            <div className="w-10 h-10 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center transform rotate-3">
                                <CheckCircle2 size={24} className="text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                TaskFlow
                            </span>
                        </div>
                        <button
                            className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = router.pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    group flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-brand-500/20 text-white border border-brand-500/30 shadow-lg shadow-brand-500/10 backdrop-blur-md relative overflow-hidden'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400 rounded-r-full" />
                                    )}
                                    <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-brand-300' : 'group-hover:scale-110'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-white/10 flex-shrink-0 bg-black/20 backdrop-blur-md">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 mb-3 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white/10 group-hover:ring-brand-400/50 transition-all">
                                {user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate group-hover:text-brand-200 transition-colors">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-base-100 border-b border-slate-200 dark:border-base-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
