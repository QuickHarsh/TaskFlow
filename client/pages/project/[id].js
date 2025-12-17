import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="card bg-base-100 shadow-xl border border-base-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-base-200 bg-base-50/50">
          <h2 className="card-title text-lg">Project Chat</h2>
          <p className="text-sm opacity-60">Real-time collaboration</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => {
            const isMe = String(m.senderId) === String(user.id);
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-base-200 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                  {!isMe && <div className="text-xs opacity-60 mb-1 font-semibold">{m.sender_name || 'User ' + m.senderId}</div>}
                  {m.content}
                </div>
                <div className="text-[10px] opacity-40 mt-1 px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          {!messages.length && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">💬</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-base-50/50 border-t border-base-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="input input-bordered w-full focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <button className="btn btn-primary px-6" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthGuard(ProjectChat);
