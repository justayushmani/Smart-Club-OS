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
      <div className="flex-1 min-w-[300px] border-r border-[#2c2c2e] px-6 last:border-r-0 flex flex-col">
        <div className="flex justify-between items-center mb-6 pt-2">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
          <span className="text-[10px] text-neutral-600">{colTasks.length}</span>
        </div>
        <div className="space-y-6 flex-1 overflow-y-auto pb-6">
          {colTasks.map(task => {
            const isAssignee = task.assignee?._id === user._id;
            const canModify = user.role !== 'member' || isAssignee;
            const canComplete = user.role !== 'member';

            return (
              <div key={task._id} className="group relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 border border-neutral-800 text-neutral-400 bg-transparent rounded-sm">
                    {task.department}
                  </span>
                  {task.deadline && <span className="text-[10px] text-neutral-500">Due {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>}
                </div>
                <h4 className="font-medium text-sm text-neutral-200 mb-2">{task.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed mb-4">{task.description}</p>
                <div className="flex items-center text-[10px] text-neutral-600 tracking-wide uppercase">
                  <span>Assignee:</span>
                  <span className="ml-2 text-neutral-400">{task.assignee?.username || 'Unassigned'}</span>
                </div>
                
                {canModify && (
                  <div className="absolute top-0 right-0 h-full bg-[#0a0a0a]/90 backdrop-blur-sm w-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                    {stage === 'todo' && <button onClick={() => updateStage(task._id, 'progress')} className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-all bg-transparent rounded-sm">Start Task</button>}
                    {stage === 'progress' && (
                      <>
                        <button onClick={() => updateStage(task._id, 'todo')} className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-all bg-transparent rounded-sm">Rewind</button>
                        {canComplete && <button onClick={() => updateStage(task._id, 'done')} className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-all bg-transparent rounded-sm">Mark Complete</button>}
                      </>
                    )}
                    {stage === 'done' && canComplete && <button onClick={() => updateStage(task._id, 'progress')} className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-all bg-transparent rounded-sm">Reopen</button>}
                  </div>
                )}
                <div className="h-[0.5px] w-full bg-neutral-800 mt-6 hidden last:block"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Project Board</h2>
          <p className="text-xs text-neutral-500">Departmental workflow execution</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-3 py-1.5 text-xs font-medium rounded hover:bg-neutral-200 transition-colors flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#161617] p-6 rounded-lg border-[0.5px] border-[#2c2c2e] mb-8">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 mb-4">
            <input type="text" placeholder="Task Title" className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <select className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-400 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors appearance-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
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
            <input type="date" className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-400 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors appearance-none" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <textarea placeholder="Technical specifics..." className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-3 text-sm h-24 w-full mb-4 focus:border-neutral-500 outline-none rounded-sm transition-colors resize-none" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors">Dispatch Task</button>
          </div>
        </form>
      )}

      <div className="flex flex-1 overflow-x-auto border-t border-l border-b border-[#2c2c2e] rounded-sm">
        {renderCol('To Do', 'todo')}
        {renderCol('In Progress', 'progress')}
        {renderCol('Done', 'done')}
      </div>
    </div>
  );
};

export default KanbanTracker;
