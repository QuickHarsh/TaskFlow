import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') || 'light';
      setMode(saved);
      document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'black' : 'light');
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } catch { }
  }, []);

  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try {
      localStorage.setItem('theme', next);
    } catch { }
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'black' : 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <button onClick={toggle} title="Toggle theme" className="btn btn-ghost btn-circle btn-sm text-slate-500 dark:text-slate-400">
      {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
