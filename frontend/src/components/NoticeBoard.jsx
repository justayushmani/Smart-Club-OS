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
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Notice Board</h2>
          <p className="text-gray-500">Stay updated with club announcements</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all">
            <Plus className="w-5 h-5 mr-2" /> New Notice
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 animate-fade-in-down">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Notice Title" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <select className="border p-3 rounded-lg w-full outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="important">Important</option>
            </select>
          </div>
          <textarea placeholder="Notice Content" className="border p-3 rounded-lg w-full h-32 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">Publish</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {notices.map(notice => (
          <div key={notice._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${notice.category === 'important' ? 'bg-red-500' : notice.category === 'event' ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${notice.category === 'important' ? 'bg-red-100 text-red-700' : notice.category === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {notice.category.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-900 mr-1">{notice.author?.username}</span>
                  ({notice.author?.role})
                </div>
              </div>
              {user.role === 'president' && (
                <button onClick={() => handleDelete(notice._id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;
