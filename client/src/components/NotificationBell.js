import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function refresh() {
    try {
      const list = await api.get('/notifications');
      setItems(list);
      setUnread(list.filter(n => !n.read_at).length);
    } catch {}
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
      <label tabIndex={0} className="btn btn-ghost btn-circle" onClick={() => setOpen(v=>!v)}>
        <div className="indicator">
          <span>🔔</span>
          {unread > 0 && <span className="badge badge-sm indicator-item">{unread}</span>}
        </div>
      </label>
      {open && (
        <div tabIndex={0} className="dropdown-content z-[100] card card-compact w-80 bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-base">Notifications</h3>
              <button className="btn btn-ghost btn-xs" onClick={markAllRead}>Mark all read</button>
            </div>
            <div className="divide-y max-h-60 overflow-auto">
              {items.map(n => (
                <div key={n.id} className="py-2 text-sm flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs opacity-70">
                      {n.type === 'task_assigned' ? 'Task assigned' : n.type === 'task_updated' ? 'Task updated' : 'Notification'}
                    </div>
                    <div>{n.payload?.title || ''}{n.payload?.status ? ` → ${n.payload.status}` : ''}</div>
                  </div>
                  {!n.read_at && <span className="badge badge-warning">new</span>}
                </div>
              ))}
              {!items.length && <div className="py-4 text-center text-sm opacity-70">No notifications</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
