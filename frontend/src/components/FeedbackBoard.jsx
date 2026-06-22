import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MessageCircle } from 'lucide-react';

const FeedbackBoard = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ text: '', category: 'General', isAnonymous: false });
  const [resolutionForms, setResolutionForms] = useState({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/feedback', form);
      setFeedbacks([res.data, ...feedbacks]);
      setForm({ text: '', category: 'General', isAnonymous: false });
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const updateStatus = async (id, status, notes) => {
    try {
      const res = await api.patch(`/feedback/${id}`, { status, resolutionNotes: notes });
      setFeedbacks(feedbacks.map(f => f._id === id ? res.data : f));
      setResolutionForms(prev => ({ ...prev, [id]: undefined }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-emerald-500 w-8 h-8" />
          Grievance & Feedback Portal
        </h2>
        <p className="text-gray-500 mt-2">Submit secure, anonymous feedback to the administration.</p>
      </div>

      <form onSubmit={submitFeedback} className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Submit New Feedback</h3>
        <textarea
          required
          className="w-full border border-gray-300 p-3 rounded-lg h-24 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="Describe your issue or suggestion here..."
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded p-2 text-sm outline-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>General</option>
              <option>Facilities</option>
              <option>Harassment</option>
              <option>Management</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded" />
              Submit Anonymously
            </label>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow">Submit Report</button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="font-bold text-xl text-gray-800 mb-4">Past Submissions {user.role === 'president' && '(Admin View)'}</h3>
        {feedbacks.length === 0 && <p className="text-gray-500 italic">No feedback records found.</p>}
        {feedbacks.map(fb => (
          <div key={fb._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded mr-2">{fb.category}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${fb.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : fb.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {fb.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">{new Date(fb.date).toLocaleDateString()}</span>
            </div>
            
            <p className="text-gray-800 mb-3 whitespace-pre-wrap font-medium">{fb.text}</p>
            
            <div className="text-sm text-gray-500 mb-4 border-b border-dashed pb-3">
              Submitted by: {fb.isAnonymous ? <span className="font-semibold text-gray-400">Anonymous</span> : <span className="font-semibold text-gray-700">{fb.submittedBy?.username}</span>}
            </div>

            {fb.resolutionNotes && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-sm text-emerald-900 mt-2">
                <strong>Admin Resolution:</strong> {fb.resolutionNotes}
              </div>
            )}

            {user.role === 'president' && fb.status !== 'Resolved' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {!resolutionForms[fb._id] ? (
                  <button onClick={() => setResolutionForms({ ...resolutionForms, [fb._id]: '' })} className="text-sm text-blue-600 font-medium hover:underline">
                    + Add Resolution / Update Status
                  </button>
                ) : (
                  <div className="bg-gray-50 p-3 rounded border">
                    <textarea 
                      placeholder="Resolution notes..." 
                      className="w-full border p-2 rounded mb-2 text-sm"
                      value={resolutionForms[fb._id]}
                      onChange={e => setResolutionForms({ ...resolutionForms, [fb._id]: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(fb._id, 'In Progress', resolutionForms[fb._id])} className="px-3 py-1 bg-amber-500 text-white text-xs rounded">Mark In Progress</button>
                      <button onClick={() => updateStatus(fb._id, 'Resolved', resolutionForms[fb._id])} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded">Mark Resolved</button>
                      <button onClick={() => setResolutionForms({ ...resolutionForms, [fb._id]: undefined })} className="px-3 py-1 text-gray-500 text-xs hover:bg-gray-200 rounded">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackBoard;
