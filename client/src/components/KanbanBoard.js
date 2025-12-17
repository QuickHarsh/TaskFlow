import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, GripVertical, Clock, CheckCircle2, Circle } from 'lucide-react';

const columns = [
  { key: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { key: 'in_progress', title: 'In Progress', color: 'bg-indigo-500' },
  { key: 'completed', title: 'Completed', color: 'bg-emerald-500' },
];

export default function KanbanBoard({ tasks = [], onUpdate, onCreate, onSelect, canDelete = false, onDelete, hideCreate = false }) {
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], completed: [] };
    tasks.forEach(t => { if (g[t.status]) g[t.status].push(t); });
    return g;
  }, [tasks]);

  function onDragEnd(result) {
    const { destination, source, draggableId } = result || {};
    if (!destination) return;
    const destCol = destination.droppableId;
    const srcCol = source.droppableId;
    if (destCol === srcCol) return;
    const id = Number(draggableId);
    onUpdate(id, { status: destCol });
  }

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
        {columns.map(col => (
          <div key={col.key} className="flex flex-col bg-slate-50 dark:bg-base-200/50 rounded-xl border border-slate-200 dark:border-base-300">
            {/* Column Header */}
            <div className="p-4 border-b border-slate-200 dark:border-base-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{col.title}</h4>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-base-100 rounded-md border border-slate-200 dark:border-base-300 text-slate-500">
                {grouped[col.key].length}
              </span>
            </div>

            {/* Column Body */}
            <Droppable droppableId={col.key}>
              {(provided, snapshot) => (
                <div
                  className={`flex-1 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-base-200' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="flex flex-col gap-3">
                    {grouped[col.key].map((t, idx) => (
                      <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                        {(prov, snap) => (
                          <div
                            className={`
                              group relative bg-white dark:bg-base-100 p-4 rounded-lg border transition-all cursor-pointer
                              ${snap.isDragging ? 'shadow-xl rotate-2 ring-2 ring-indigo-500 border-transparent z-50' : 'shadow-sm border-slate-200 dark:border-base-300 hover:border-indigo-300 dark:hover:border-indigo-700'}
                            `}
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() => onSelect && onSelect(t)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                                {t.title}
                              </span>
                              {canDelete && (
                                <button
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); onDelete && onDelete(t.id); }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(t.priority)}`}>
                                {t.priority}
                              </span>

                              {t.due_date && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Clock size={12} />
                                  <span>{String(t.due_date).slice(5, 10)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}

        {!hideCreate && (
          <div className="flex flex-col bg-slate-50 dark:bg-base-200/50 rounded-xl border border-slate-200 dark:border-base-300 opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-4 border-b border-slate-200 dark:border-base-300">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200">New Task</h4>
            </div>
            <div className="p-4 space-y-3">
              <input
                className="input input-sm input-bordered w-full bg-white dark:bg-base-100"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <select
                className="select select-sm select-bordered w-full bg-white dark:bg-base-100"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                className="btn btn-sm btn-primary w-full"
                onClick={() => { if (newTask.title) { onCreate({ ...newTask }); setNewTask({ title: '', priority: 'medium' }); } }}
                disabled={!newTask.title}
              >
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
