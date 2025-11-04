import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    setMounted(true);
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u || {});
    } catch {}
  }, []);

  return (
    <div className="navbar bg-base-100 shadow">
      <div className="flex-1 items-center gap-2">
        <a href="/dashboard" className="btn btn-ghost normal-case text-xl">TaskFlow</a>
        <a href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
        <a href="/projects" className="btn btn-ghost btn-sm">Projects</a>
      </div>
      <div className="flex-none gap-2 items-center">
        <NotificationBell />
        <ThemeToggle />
        <span className="badge badge-outline hidden sm:flex">{mounted ? (user.name || user.email || '') : ''}</span>
        <button className="btn btn-sm" onClick={() => { localStorage.clear(); window.location.href='/login'; }}>Logout</button>
      </div>
    </div>
  );
}
