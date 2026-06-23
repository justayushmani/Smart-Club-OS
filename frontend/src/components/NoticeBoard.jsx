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
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-10 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Notice Board</h2>
          <p className="text-xs text-neutral-500">Official club announcements and broadcasts.</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-3 py-1.5 text-xs font-medium rounded hover:bg-neutral-200 transition-colors flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Post
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#161617] p-6 rounded-lg border-[0.5px] border-[#2c2c2e] mb-10">
          <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
            <input type="text" placeholder="Post Title" className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <select className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-400 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="important">Important</option>
            </select>
          </div>
          <textarea placeholder="Write the announcement..." className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-3 text-sm h-32 w-full mb-4 focus:border-neutral-500 outline-none rounded-sm transition-colors resize-none" required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors">Publish</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {notices.map(notice => (
          <div key={notice._id} className="bg-[#161617] p-8 rounded-lg border-[0.5px] border-[#2c2c2e] transition-all duration-150 ease-in-out hover:bg-neutral-800/40 hover:border-neutral-700 relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="border border-neutral-800 text-neutral-400 bg-transparent px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm">
                {notice.category}
              </span>
              {user.role === 'president' && (
                <button onClick={() => handleDelete(notice._id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-4">{notice.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
            <div className="mt-8 flex items-center text-[11px] text-neutral-500 uppercase tracking-widest">
              <span className="text-neutral-300 mr-2">{notice.author?.username}</span>
              <div className="w-[1px] h-3 bg-neutral-800 mx-2"></div>
              <span>{new Date(notice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center text-neutral-600 text-sm py-10">No active notices.</div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
