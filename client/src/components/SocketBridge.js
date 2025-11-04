import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { useToast } from './Toast';

export default function SocketBridge() {
  const t = useToast();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id) {
        socket.emit('registerUser', user.id);
      }
    } catch {}

    function onNotif(n) {
      const msg = n?.type === 'task_assigned'
        ? `New task assigned: ${n?.payload?.title || ''}`
        : n?.type === 'task_updated'
          ? `Task updated: ${n?.payload?.title || ''} → ${n?.payload?.status || ''}`
          : 'Notification';
      t.show(msg, 'info');
    }

    socket.on('notification', onNotif);
    return () => socket.off('notification', onNotif);
  }, []);

  return null;
}
