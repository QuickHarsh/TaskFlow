import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../src/components/Navbar';
import { api, withAuthGuard } from '../../src/lib/api';
import { socket } from '../../src/lib/socket';

function ProjectChat() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => {
    if (!id) return;
    (async () => {
      const msgs = await api.get(`/messages/${id}`);
      setMessages(msgs);
      socket.emit('joinProject', id);
    })();
  }, [id]);

  useEffect(() => {
    function onMessage(m) {
      if (String(m.project_id) === String(id)) setMessages(prev => [...prev, m]);
    }
    socket.on('message', onMessage);
    return () => socket.off('message', onMessage);
  }, [id]);

  async function send() {
    const content = inputRef.current.value.trim();
    if (!content) return;
    socket.emit('message', { projectId: Number(id), senderId: user.id, content });
    inputRef.current.value = '';
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Project Chat</h2>
            <div className="rounded border border-base-300 p-3 max-h-[420px] overflow-auto">
              {messages.map(m => (
                <div key={m.id} className="py-2 border-b border-base-200 last:border-b-0">
                  <strong className="opacity-80">{m.sender_name || m.senderId}:</strong> <span>{m.content}</span>
                </div>
              ))}
              {!messages.length && <div className="opacity-60 text-sm">No messages yet.</div>}
            </div>
            <div className="flex gap-2">
              <input ref={inputRef} className="input input-bordered w-full" placeholder="Type a message" onKeyDown={(e)=>{ if (e.key==='Enter') send(); }} />
              <button className="btn btn-primary" onClick={send}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthGuard(ProjectChat);
