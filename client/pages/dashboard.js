import { useEffect, useMemo, useState } from 'react';
import { api, withAuthGuard } from '../src/lib/api';
import Navbar from '../src/components/Navbar';
import KanbanBoard from '../src/components/KanbanBoard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useToast } from '../src/components/Toast';
import TaskModal from '../src/components/TaskModal';

function Dashboard() {
  const t = useToast();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [role, setRole] = useState('member');
  const [newTaskTop, setNewTaskTop] = useState({ title: '', priority: 'medium' });

  useEffect(() => {
    (async () => {
      try {
        const p = await api.get('/projects');
        setProjects(p);
        if (p.length) setSelectedProject(p[0]);
        // preload users for task modal
        const u = await api.get('/users');
        setUsers(u);
      } catch (e) {
        t.show(e.message || 'Failed to load projects', 'error');
      } finally {
        setLoadingProjects(false);
      }
    })();
    // get role from localStorage
    try {
      const me = JSON.parse(localStorage.getItem('user') || '{}');
      if (me?.role) setRole(me.role);
    } catch {}
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    (async () => {
      setLoadingTasks(true);
      try {
        const tdata = await api.get('/tasks?projectId=' + selectedProject.id);
        setTasks(tdata);
      } catch (e) {
        t.show(e.message || 'Failed to load tasks', 'error');
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, [selectedProject]);

  const chartData = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const key = (t.due_date || t.created_at || '').slice(0,10) || 'N/A';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [tasks]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
        <div className="flex items-center gap-3 mb-3">
          {loadingProjects ? (
            <div className="opacity-60 text-sm">Loading projects...</div>
          ) : (
            <>
              <select className="select select-bordered" value={selectedProject?.id || ''} onChange={(e)=>{
                const p = projects.find(x=>x.id === Number(e.target.value));
                setSelectedProject(p || null);
              }}>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {selectedProject && (
                <a className="btn btn-ghost btn-sm" href={`/project/${selectedProject.id}`}>Open Project Chat</a>
              )}
              {!projects.length && (
                <div className="opacity-70 text-sm">No projects yet. Create one on the <a className="link" href="/projects">Projects</a> page.</div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="card bg-base-100 shadow" style={{flex:1}}>
            <div className="card-body">
              <h3 className="card-title">Tasks</h3>
              {loadingTasks && <div className="opacity-70 text-sm">Loading tasks...</div>}
              {/* Add Task (top) */}
              <div className="rounded border border-base-300 p-3 mb-3 flex items-center gap-2">
                <input className="input input-bordered w-full" placeholder="Task title"
                  value={newTaskTop.title} onChange={(e)=>setNewTaskTop({...newTaskTop, title: e.target.value})} />
                <select className="select select-bordered"
                  value={newTaskTop.priority} onChange={(e)=>setNewTaskTop({...newTaskTop, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button className="btn btn-primary" onClick={async ()=>{
                  if (!selectedProject || !newTaskTop.title.trim()) return;
                  const created = await api.post('/tasks', { title: newTaskTop.title.trim(), priority: newTaskTop.priority, projectId: selectedProject.id });
                  setTasks(prev=>[...prev, created]);
                  setNewTaskTop({ title:'', priority:'medium' });
                }}>Add</button>
              </div>
              <KanbanBoard tasks={tasks} onUpdate={async (id, data)=>{
              const updated = await api.patch(`/tasks/${id}`, data);
              setTasks(prev=>prev.map(t=>t.id===id?updated:t));
            }} onCreate={async (payload)=>{
              if (!selectedProject) return;
              const created = await api.post('/tasks', { ...payload, projectId: selectedProject.id });
              setTasks(prev=>[...prev, created]);
            }} hideCreate onSelect={(task)=> setActiveTask(task)} canDelete={role==='admin'} onDelete={async (id)=>{
              try {
                await api.delete(`/tasks/${id}`);
                setTasks(prev=>prev.filter(t=>t.id!==id));
                t.show('Task deleted', 'success');
              } catch (e) {
                t.show(e.message || 'Failed to delete task', 'error');
              }
            }} />
            </div>
          </div>

          <div className="card bg-base-100 shadow" style={{flex:1}}>
            <div className="card-body">
              <h3 className="card-title">Productivity</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <TaskModal open={!!activeTask} task={activeTask} users={users} onClose={()=> setActiveTask(null)} onSaved={(u)=>{
        setTasks(prev=>prev.map(t=> t.id===u.id ? u : t));
      }} />
    </div>
  );
}

export default withAuthGuard(Dashboard);
