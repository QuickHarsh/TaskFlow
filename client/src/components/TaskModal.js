import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { api } from '../lib/api';
import { X, Calendar, User, AlignLeft, List, Tag, Check, AlertCircle } from 'lucide-react';

export default function TaskModal({ open, task, projectId, onClose, onSaved, users = [] }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (task && task.id) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          assigneeId: task.assignee_id || '',
          dueDate: task.due_date ? String(task.due_date).slice(0, 10) : '',
        });
      } else {
        // Reset for new task
        setForm({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' });
      }
    }
  }, [open, task]);

  async function save() {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        dueDate: form.dueDate || null,
        projectId: projectId // only needed for create, but harmless for update usually (ignored by backend if strict, or we verify)
      };

      let result;
      if (isEdit) {
        result = await api.patch(`/tasks/${task.id}`, payload);
      } else {
        result = await api.post('/tasks', payload);
      }

      onSaved && onSaved(result);
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/50 transition-opacity backdrop-blur-sm" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-base-200 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-slate-200 dark:border-base-300">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-base-300 flex items-center justify-between bg-slate-50/50 dark:bg-base-200/50">
            <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Task' : 'New Task'}
            </h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-base-300 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Title */}
            <div>
              <input
                className="w-full text-lg font-semibold placeholder:text-slate-400 border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-0 bg-transparent text-slate-900 dark:text-white transition-colors"
                placeholder="Task Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <List size={12} /> Status
                </label>
                <select
                  className="select select-bordered select-sm w-full font-normal"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> Priority
                </label>
                <select
                  className="select select-bordered select-sm w-full font-normal"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User size={12} /> Assignee
                </label>
                <select
                  className="select select-bordered select-sm w-full font-normal"
                  value={form.assigneeId}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar size={12} /> Due Date
                </label>
                <input
                  type="date"
                  className="input input-sm input-bordered w-full font-normal block"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <AlignLeft size={12} /> Description
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32 leading-relaxed"
                placeholder="Add a detailed description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-base-200/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-slate-100 dark:border-base-300">
            <button
              type="button"
              className="btn btn-primary min-w-[100px]"
              onClick={save}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
