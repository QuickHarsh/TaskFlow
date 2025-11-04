import { useEffect, useState } from 'react';
import Navbar from '../src/components/Navbar';
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
    } catch {}
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
      <Navbar />
      <div className="container">
        <h2 className="text-2xl font-semibold mb-2">Projects</h2>
        {loading ? (
          <div className="card bg-base-100 shadow"><div className="card-body">Loading...</div></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {(role === 'admin' || role === 'manager') && (
              <div className="card bg-base-100 shadow" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3 className="card-title">Create Project</h3>
                  <form onSubmit={createProject} className="flex flex-col gap-2">
                    <input className="input input-bordered" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
                    <input className="input input-bordered" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
                    <div className="rounded border border-base-300 p-2 max-h-44 overflow-auto">
                      <strong className="block mb-1">Members</strong>
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="checkbox checkbox-sm" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} /> {u.name || u.email}
                        </label>
                      ))}
                      {!users.length && <div className="opacity-60 text-sm">No users</div>}
                    </div>
                    <button type="submit" className="btn btn-primary">Create</button>
                  </form>
                  <p className="opacity-70 text-sm">Only Admin/Manager can create projects.</p>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow" style={{ flex: 1 }}>
              <div className="card-body">
                <h3 className="card-title">Your Projects</h3>
                {!projects.length && <div className="opacity-70 text-sm">No projects yet.</div>}
                <div className="divide-y">
                  {projects.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="truncate block">{p.name}</strong>
                        <div className="opacity-70 text-sm truncate">{p.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a className="btn btn-ghost btn-sm" href={`/project/${p.id}`}>Open Chat</a>
                        {role === 'admin' && (
                          <button className="btn btn-error btn-sm" onClick={async ()=>{
                            if (!confirm('Delete this project and all its tasks/messages?')) return;
                            try {
                              await api.delete(`/projects/${p.id}`);
                              setProjects(prev=>prev.filter(x=>x.id!==p.id));
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
    </div>
  );
}

export default withAuthGuard(ProjectsPage);
