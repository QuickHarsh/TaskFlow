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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
            Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Welcome back! Here's your efficiency overview.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-base-200 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-base-300">
          {loadingProjects ? (
            <div className="px-4 py-2 text-sm text-slate-500 animate-pulse">Loading projects...</div>
          ) : (
            <>
              <select
                className="select select-ghost select-sm w-full sm:w-auto font-medium focus:outline-none focus:bg-transparent"
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
                <a className="btn btn-sm bg-brand-500 hover:bg-brand-600 text-white border-none rounded-xl px-6 shadow-lg shadow-brand-500/30" href={`/project/${selectedProject.id}`}>
                  Project Chat
                </a>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* Productivity Chart */}
        <div className="glass shadow-xl rounded-3xl xl:col-span-3 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="p-8 relative z-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-brand-500 rounded-full" />
              Task Activity
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      <div className="glass shadow-xl rounded-3xl border-none overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="p-8 bg-white/50 dark:bg-base-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                <div className="w-2 h-2 bg-brand-500 rounded-full" />
              </span>
              Task Board
            </h3>
            <button
              className="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 shadow-lg"
              onClick={() => {
                if (!selectedProject) return t.show('Please select a project first', 'error');
                setActiveTask({});
              }}
            >
              <Plus size={18} /> New Task
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
            hideCreate={true}
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
