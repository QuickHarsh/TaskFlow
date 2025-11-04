import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') || 'light';
      setMode(saved);
      // DaisyUI theme attribute + dark class fallback
      document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'black' : 'light');
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } catch {}
  }, []);

  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'black' : 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <button onClick={toggle} title="Toggle theme" className="btn btn-sm">
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
