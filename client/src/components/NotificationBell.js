import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import { Bell, Check } from 'lucide-react';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function refresh() {
    try {
      const list = await api.get('/notifications');
      setItems(list);
      setUnread(list.filter(n => !n.read_at).length);
    } catch { }
  }

  useEffect(() => {
    refresh();
    const onNotif = () => refresh();
    socket.on('notification', onNotif);
    return () => socket.off('notification', onNotif);
  }, []);

  async function markAllRead() {
    const ids = items.filter(n => !n.read_at).map(n => n.id);
    if (!ids.length) return;
    await api.post('/notifications/read', { ids });
    refresh();
  }

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm" onClick={() => setOpen(v => !v)}>
        <div className="indicator">
          <Bell size={20} className="text-slate-500 dark:text-slate-400" />
          {unread > 0 && <span className="badge badge-xs badge-primary indicator-item"></span>}
        </div>
      </label>
      {open && (
        <div tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-80 border border-base-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-base-200">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No notifications
              </div>
            ) : (
              items.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-base-100 last:border-0 hover:bg-base-200/50 transition-colors ${!n.read_at ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{n.payload?.title || 'Notification'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {n.type === 'task_assigned' ? 'New assignment' : 'Update'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
