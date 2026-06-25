import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'general', content: '' });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/notices', formData);
      setNotices([res.data, ...notices]);
      setShowForm(false);
      setFormData({ title: '', category: 'general', content: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto font-sans text-ink">
      <div className="flex justify-between items-end mb-10 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Notice Board</h2>
          <p className="text-sm font-mono text-neutral-600">Official club announcements and broadcasts.</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="schematic-button flex items-center text-xs">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="schematic-card p-6 mb-10">
          <div className="grid grid-cols-[2fr_1fr] gap-6 mb-6">
            <input 
              type="text" 
              placeholder="Post Title" 
              className="schematic-input text-lg" 
              required 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
            <select 
              className="schematic-input text-sm appearance-none" 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="important">Important</option>
            </select>
          </div>
          <textarea 
            placeholder="Write the announcement..." 
            className="schematic-input w-full h-32 resize-none text-sm mb-6" 
            required 
            value={formData.content} 
            onChange={e => setFormData({ ...formData, content: e.target.value })} 
          />
          <div className="flex justify-end gap-4 font-mono">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-ink transition-colors font-bold">Cancel</button>
            <button type="submit" className="schematic-button text-xs">Publish</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {notices.map(notice => (
          <div key={notice._id} className="schematic-card-flat p-8 transition-all duration-150 ease-in-out hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#111111] group">
            <div className="flex justify-between items-start mb-4">
              <span className="border-2 border-ink text-ink bg-transparent px-2 py-1 text-[10px] font-mono uppercase tracking-widest font-bold">
                {notice.category}
              </span>
              {user.role === 'president' && (
                <button onClick={() => handleDelete(notice._id)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <h3 className="text-2xl font-bold text-ink mb-4">{notice.title}</h3>
            <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">{notice.content}</p>
            <div className="mt-8 flex items-center text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
              <span className="text-blueprint">{notice.author?.username}</span>
              <div className="w-[2px] h-3 bg-ink mx-3"></div>
              <span>{new Date(notice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center font-mono text-neutral-500 text-sm py-10 uppercase tracking-widest">No active notices.</div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
