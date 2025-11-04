import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function TaskModal({ open, task, onClose, onSaved, users = [] }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: null, dueDate: '' });
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assigneeId: task.assignee_id || null,
        dueDate: task.due_date ? String(task.due_date).slice(0, 10) : '',
      });
    }
  }, [task]);

  if (!open || !task) return null;

  async function save() {
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
    };
    const updated = await api.patch(`/tasks/${task.id}`, payload);
    onSaved && onSaved(updated);
    onClose && onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={onClose}>
      <div className="card" style={{ width: 500, maxWidth: '90%', cursor: 'default' }} onClick={(e)=>e.stopPropagation()}>
        <h3>Edit Task</h3>
        <input placeholder="Title" value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
        <div className="row">
          <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={form.priority} onChange={(e)=>setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="row">
          <select value={form.assigneeId || ''} onChange={(e)=>setForm({ ...form, assigneeId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.email}</option>
            ))}
          </select>
          <input type="date" value={form.dueDate} onChange={(e)=>setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="link" onClick={onClose}>Cancel</button>
          <button onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
