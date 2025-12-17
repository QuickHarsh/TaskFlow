import { useEffect, useState } from 'react';
import { api, withAuthGuard } from '../src/lib/api';
import { useToast } from '../src/components/Toast';

function ProjectsPage() {
  const t = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] });
  const [role, setRole] = useState('member');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.role) setRole(u.role);
    } catch { }
    (async () => {
      try {
        const [p, u] = await Promise.all([
          api.get('/projects'),
          api.get('/users'),
        ]);
        setProjects(p);
        setUsers(u);
      } catch (e) {
        t.show(e.message || 'Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createProject(e) {
    e.preventDefault();
    if (!form.name.trim()) return t.show('Project name is required', 'error');
    try {
      const created = await api.post('/projects', {
        name: form.name.trim(),
        description: form.description || '',
        memberIds: form.memberIds,
      });
      setProjects((prev) => [created, ...prev]);
      setForm({ name: '', description: '', memberIds: [] });
      t.show('Project created', 'success');
    } catch (e) {
      t.show(e.message || 'Failed to create project', 'error');
    }
  }

  function toggleMember(id) {
    setForm((f) => {
      const has = f.memberIds.includes(id);
      return { ...f, memberIds: has ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id] };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h2>
      </div>

      {loading ? (
        <div className="card bg-base-100 shadow"><div className="card-body">Loading...</div></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {(role === 'admin' || role === 'manager') && (
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Create Project</h3>
                <form onSubmit={createProject} className="flex flex-col gap-4">
                  <input className="input input-bordered w-full" placeholder="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div className="rounded-lg border border-base-300 p-3 max-h-44 overflow-auto bg-base-50 dark:bg-base-200/50">
                    <strong className="block mb-2 text-sm text-slate-500 uppercase tracking-wide">Members</strong>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-base-200 p-1.5 rounded transition-colors">
                          <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} />
                          <span className="text-slate-700 dark:text-slate-300">{u.name || u.email}</span>
                        </label>
                      ))}
                    </div>
                    {!users.length && <div className="opacity-60 text-sm">No users found.</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Create Project</button>
                </form>
                <div className="divider my-0"></div>
                <p className="opacity-70 text-xs text-center">Only Admin/Manager can create projects.</p>
              </div>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl border border-base-200 h-fit">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Your Projects</h3>
              {!projects.length && <div className="opacity-70 text-sm py-8 text-center bg-base-50 rounded-lg">No projects yet.</div>}
              <div className="divide-y divide-base-200">
                {projects.map((p) => (
                  <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                    <div className="min-w-0">
                      <strong className="block text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</strong>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <a className="btn btn-sm btn-outline" href={`/project/${p.id}`}>Chat</a>
                      {role === 'admin' && (
                        <button className="btn btn-error btn-outline btn-xs" onClick={async () => {
                          if (!confirm('Delete this project and all its tasks/messages?')) return;
                          try {
                            await api.delete(`/projects/${p.id}`);
                            setProjects(prev => prev.filter(x => x.id !== p.id));
                            t.show('Project deleted', 'success');
                          } catch (e) {
                            t.show(e.message || 'Failed to delete project', 'error');
                          }
                        }}>Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthGuard(ProjectsPage);
