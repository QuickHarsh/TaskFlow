import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'completed', title: 'Completed' },
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban">
        {columns.map(col => (
          <Droppable droppableId={col.key} key={col.key}>
            {(provided) => (
              <div className="column" ref={provided.innerRef} {...provided.droppableProps}>
                <h4>{col.title}</h4>
                {grouped[col.key].map((t, idx) => (
                  <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                    {(prov) => (
                      <div className="card task" ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} onClick={()=> onSelect && onSelect(t)}>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <strong>{t.title}</strong>
                          <div className="row">
                            <select value={t.status} onChange={(e)=> { e.stopPropagation(); onUpdate(t.id, { status: e.target.value })}}>
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            {canDelete && (
                              <button className="btn btn-ghost btn-xs" onClick={(e)=>{ e.stopPropagation(); onDelete && onDelete(t.id); }}>Delete</button>
                            )}
                          </div>
                        </div>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <span className={`pill ${t.priority}`}>{t.priority}</span>
                          {t.due_date && <small>Due: {String(t.due_date).slice(0,10)}</small>}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}

        {!hideCreate && (
          <div className="column">
            <h4>Create Task</h4>
            <div className="card">
              <input placeholder="Title" value={newTask.title} onChange={(e)=>setNewTask({...newTask, title: e.target.value})} />
              <select value={newTask.priority} onChange={(e)=>setNewTask({...newTask, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button onClick={()=>{ if(newTask.title){ onCreate({ ...newTask }); setNewTask({ title:'', priority:'medium' }); } }}>Add</button>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
