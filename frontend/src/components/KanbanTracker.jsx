import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const KanbanTracker = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: user.department || 'common', description: '', deadline: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', formData);
      setTasks([res.data, ...tasks]);
      setShowForm(false);
      setFormData({ title: '', department: user.department || 'common', description: '', deadline: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const updateStage = async (id, stage) => {
    try {
      const res = await api.patch(`/tasks/${id}`, { stage });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const renderCol = (title, stage) => {
    const colTasks = tasks.filter(t => t.stage === stage);
    return (
      <div className="flex-1 min-w-[320px] border-2 border-ink bg-white rounded-none p-4 flex flex-col shadow-[4px_4px_0_0_#111111] mb-2 relative">
        <div className="flex justify-between items-center mb-6 pt-2 border-b-2 border-ink pb-3">
          <h3 className="text-[11px] font-mono font-bold text-ink uppercase tracking-widest">{title}</h3>
          <span className="text-[10px] font-mono text-blueprint bg-blueprint/10 px-2 py-0.5 border-2 border-blueprint">{colTasks.length} items</span>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pb-4 pr-1">
          {colTasks.map(task => {
            const isAssignee = task.assignee?._id === user._id;
            const canModify = user.role !== 'member' || isAssignee;
            const canComplete = user.role !== 'member';

            return (
              <div key={task._id} className="group relative schematic-card p-4 flex mb-4">
                {/* Line numbers gutter */}
                <div className="w-6 shrink-0 border-r-2 border-drafting mr-3 flex flex-col items-center text-[9px] text-neutral-400 font-mono py-1 select-none">
                  <span>01</span><span>02</span><span>03</span><span>04</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-blueprint bg-blueprint/5 px-1.5 py-0.5 border border-blueprint/20">
                      {`{"dept":"${task.department}"}`}
                    </span>
                    {task.deadline && <span className="text-[10px] text-neutral-500 font-mono font-bold">Due: {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
                  </div>
                  <h4 className="font-bold text-sm text-ink mb-2 font-mono">{task.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">{task.description}</p>
                  <div className="flex items-center text-[10px] text-neutral-500 font-mono">
                    <span>assignee:</span>
                    <span className="ml-2 text-blueprint font-bold">"{task.assignee?.username || 'unassigned'}"</span>
                  </div>
                  
                  {canModify && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out font-mono z-10">
                      {stage === 'todo' && <button onClick={() => updateStage(task._id, 'progress')} className="schematic-button text-[10px]">$ ./start_task.sh</button>}
                      {stage === 'progress' && (
                        <>
                          <button onClick={() => updateStage(task._id, 'todo')} className="schematic-button text-[10px]">git revert</button>
                          {canComplete && <button onClick={() => updateStage(task._id, 'done')} className="schematic-button text-[10px]">make complete</button>}
                        </>
                      )}
                      {stage === 'done' && canComplete && <button onClick={() => updateStage(task._id, 'progress')} className="schematic-button text-[10px]">git checkout progress</button>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-xl font-bold text-ink mb-1 font-mono">Project Board</h2>
          <p className="text-xs text-neutral-500 font-mono">~/departmental_workflow_execution</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="schematic-button text-xs flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> [Insert_Task]
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="schematic-card p-6 mb-8 font-mono">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 mb-4">
            <input type="text" placeholder="Task Title" className="schematic-input px-3 py-2 text-sm text-ink" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <select className="schematic-input text-blueprint px-3 py-2 text-sm appearance-none font-bold" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
              {user.role === 'president' ? (
                <>
                  <option value="tech">Tech</option>
                  <option value="design">Design</option>
                  <option value="pr">PR</option>
                  <option value="common">Common</option>
                </>
              ) : (
                <option value={user.department}>{user.department}</option>
              )}
            </select>
            <input type="date" className="schematic-input px-3 py-2 text-sm appearance-none text-ink" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <textarea placeholder="Technical specifics..." className="schematic-input px-3 py-3 text-sm h-24 w-full mb-4 resize-none text-ink" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex justify-end gap-4 mt-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-neutral-500 hover:text-ink transition-colors font-bold tracking-widest uppercase">[Esc]</button>
            <button type="submit" className="schematic-button text-xs">[Enter ↵] Dispatch</button>
          </div>
        </form>
      )}

      <div className="flex flex-1 overflow-x-auto gap-6 pb-4">
        {renderCol('On the Prep Table', 'todo')}
        {renderCol('On the Stove', 'progress')}
        {renderCol('Plated & Served', 'done')}
      </div>
    </div>
  );
};

export default KanbanTracker;
