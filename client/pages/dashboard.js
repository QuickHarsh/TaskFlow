import { useEffect, useMemo, useState } from 'react';
import { api, withAuthGuard } from '../src/lib/api';
import KanbanBoard from '../src/components/KanbanBoard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useToast } from '../src/components/Toast';
import TaskModal from '../src/components/TaskModal';
import { Plus } from 'lucide-react';

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
    } catch { }
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
      const key = (t.due_date || t.created_at || '').slice(0, 10) || 'N/A';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [tasks]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
        </div>

        <div className="flex items-center gap-3">
          {loadingProjects ? (
            <div className="text-sm text-slate-500">Loading projects...</div>
          ) : (
            <>
              <select
                className="select select-bordered select-sm w-full sm:w-auto"
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find(x => x.id === Number(e.target.value));
                  setSelectedProject(p || null);
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {selectedProject && (
                <a className="btn btn-primary btn-sm" href={`/project/${selectedProject.id}`}>
                  Project Chat
                </a>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Productivity Chart */}
        <div className="card bg-base-100 shadow-xl border border-base-200 xl:col-span-3">
          <div className="card-body">
            <h3 className="card-title text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">Task Activity</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="card-title">Task Board</h3>
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => {
                if (!selectedProject) return t.show('Please select a project first', 'error');
                setActiveTask({}); // Empty object triggers 'Create' mode in modal logic if we verify
              }}
            >
              <Plus size={16} /> New Task
            </button>
          </div>

          <KanbanBoard
            tasks={tasks}
            onUpdate={async (id, data) => {
              const updated = await api.patch(`/tasks/${id}`, data);
              setTasks(prev => prev.map(t => t.id === id ? updated : t));
            }}
            onCreate={() => {
              if (!selectedProject) return t.show('Please select a project first', 'error');
              setActiveTask({});
            }}
            hideCreate={true} // We can hide the inline create if we want, or keep it. User asked for modal creation "ask description etc". 
            // The user said "when i create a task... they asking description... make sure it ask on creating". 
            // So we should probably disable/hide the simple inline create in Kanban or make it open the modal?
            // The KanbanBoard component has a 'Create Task' column. Let's hide it or update it.
            // For now, let's just make the "New Task" button work.
            onSelect={(task) => setActiveTask(task)}
            canDelete={role === 'admin'}
            onDelete={async (id) => {
              try {
                await api.delete(`/tasks/${id}`);
                setTasks(prev => prev.filter(t => t.id !== id));
                t.show('Task deleted', 'success');
              } catch (e) {
                t.show(e.message || 'Failed to delete task', 'error');
              }
            }}
          />
        </div>
      </div>

      <TaskModal
        open={!!activeTask}
        task={activeTask}
        projectId={selectedProject?.id}
        users={users}
        onClose={() => setActiveTask(null)}
        onSaved={(u) => {
          if (activeTask && activeTask.id) {
            // update
            setTasks(prev => prev.map(t => t.id === u.id ? u : t));
          } else {
            // create
            setTasks(prev => [...prev, u]);
          }
        }}
      />
    </div>
  );
}

export default withAuthGuard(Dashboard);
