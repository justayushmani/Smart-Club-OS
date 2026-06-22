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
      <div className="flex-1 kanban-col">
        <h3 className="font-bold text-lg text-gray-700 mb-4 capitalize">{title} ({colTasks.length})</h3>
        <div className="space-y-3">
          {colTasks.map(task => {
            const isAssignee = task.assignee?._id === user._id;
            const canModify = user.role !== 'member' || isAssignee;
            const canComplete = user.role !== 'member';

            return (
              <div key={task._id} className="kanban-card">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-700 rounded capitalize">{task.department}</span>
                  {task.deadline && <span className="text-xs text-red-500 font-medium">Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                <div className="text-xs text-gray-500 mb-4">Assigned: {task.assignee?.username || 'Unassigned'}</div>
                
                {canModify && (
                  <div className="flex gap-2">
                    {stage === 'todo' && <button onClick={() => updateStage(task._id, 'progress')} className="flex-1 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium transition-colors">Start Progress</button>}
                    {stage === 'progress' && (
                      <>
                        <button onClick={() => updateStage(task._id, 'todo')} className="flex-1 py-1.5 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded font-medium transition-colors">Back</button>
                        {canComplete && <button onClick={() => updateStage(task._id, 'done')} className="flex-1 py-1.5 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded font-medium transition-colors">Complete</button>}
                      </>
                    )}
                    {stage === 'done' && canComplete && <button onClick={() => updateStage(task._id, 'progress')} className="w-full py-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors">Reopen</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Task Tracker</h2>
          <p className="text-gray-500">Manage departmental workflows</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md">
            <Plus className="w-5 h-5 mr-2" /> Create Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 shrink-0">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Task Title" className="border p-2 rounded w-full" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <select className="border p-2 rounded w-full capitalize" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
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
            <input type="date" className="border p-2 rounded w-full" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <textarea placeholder="Description" className="border p-2 rounded w-full h-20 mb-4" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded shadow">Add Task</button>
          </div>
        </form>
      )}

      <div className="flex gap-6 flex-1 overflow-hidden">
        {renderCol('To Do', 'todo')}
        {renderCol('In Progress', 'progress')}
        {renderCol('Done', 'done')}
      </div>
    </div>
  );
};

export default KanbanTracker;
