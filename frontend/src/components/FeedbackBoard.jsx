import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-10 border-b border-[#2c2c2e] pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Feedback Registry</h2>
          <p className="text-xs text-neutral-500">Secure, closed-loop grievance pipeline</p>
        </div>
      </div>

      <form onSubmit={submitFeedback} className="bg-[#161617] p-8 rounded-sm border-[0.5px] border-[#2c2c2e] mb-12">
        <textarea
          required
          className="w-full bg-transparent border-b border-[#2c2c2e] text-neutral-200 py-3 text-sm focus:border-white focus:outline-none transition-colors resize-none h-16 mb-6 placeholder-neutral-600"
          placeholder="Log a new concern or suggestion..."
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <select className="bg-transparent text-neutral-400 text-xs uppercase tracking-widest outline-none cursor-pointer appearance-none border-b border-transparent focus:border-[#2c2c2e]" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option className="bg-[#0a0a0a]">General</option>
              <option className="bg-[#0a0a0a]">Facilities</option>
              <option className="bg-[#0a0a0a]">Harassment</option>
              <option className="bg-[#0a0a0a]">Management</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} className="appearance-none w-3 h-3 border border-[#2c2c2e] rounded-sm checked:bg-white checked:border-white cursor-pointer transition-colors" />
              Anon Mode
            </label>
          </div>
          <button type="submit" className="bg-white text-black px-4 py-1.5 rounded-sm text-xs font-medium hover:bg-neutral-200 transition-colors">Submit</button>
        </div>
      </form>

      <div className="space-y-8">
        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">Archive</h3>
        {feedbacks.length === 0 && <p className="text-sm text-neutral-600 italic">No registry records found.</p>}
        {feedbacks.map(fb => (
          <div key={fb._id} className="relative group pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#2c2c2e]"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[9px] border border-neutral-800 text-neutral-400 px-1.5 py-0.5 uppercase tracking-widest rounded-sm">
                  {fb.category}
                </span>
                <span className={`text-[9px] uppercase tracking-widest ${fb.status === 'Resolved' ? 'text-indigo-400' : fb.status === 'In Progress' ? 'text-amber-500' : 'text-neutral-500'}`}>
                  {fb.status}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 tracking-widest uppercase">{new Date(fb.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </div>
            
            <p className="text-neutral-300 text-sm leading-relaxed mb-4 pl-2 border-l-2 border-[#161617] whitespace-pre-wrap italic">
              "{fb.text}"
            </p>
            
            <div className="flex items-center text-[10px] text-neutral-600 uppercase tracking-widest mb-4">
              <span className="mr-2">Origin:</span>
              {fb.isAnonymous ? <span className="text-neutral-500">Anonymous</span> : <span className="text-neutral-300">{fb.submittedBy?.username}</span>}
            </div>

            {fb.resolutionNotes && (
              <div className="bg-[#161617] p-4 rounded-sm border-[0.5px] border-[#2c2c2e] mt-2 mb-4">
                <span className="block text-[9px] text-neutral-500 uppercase tracking-widest mb-2">Resolution Output</span>
                <p className="text-sm text-neutral-300">{fb.resolutionNotes}</p>
              </div>
            )}

            {user.role === 'president' && fb.status !== 'Resolved' && (
              <div className="mt-4">
                {!resolutionForms[fb._id] && resolutionForms[fb._id] !== '' ? (
                  <button onClick={() => setResolutionForms({ ...resolutionForms, [fb._id]: '' })} className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                    + Append Resolution
                  </button>
                ) : (
                  <div className="mt-2">
                    <textarea 
                      placeholder="Publish resolution steps..." 
                      className="w-full bg-transparent border-b border-[#2c2c2e] text-neutral-200 py-2 text-sm focus:border-white focus:outline-none transition-colors resize-none placeholder-neutral-600 mb-3"
                      value={resolutionForms[fb._id]}
                      onChange={e => setResolutionForms({ ...resolutionForms, [fb._id]: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <button onClick={() => updateStatus(fb._id, 'In Progress', resolutionForms[fb._id])} className="text-[10px] uppercase tracking-widest border border-neutral-800 text-neutral-400 hover:text-white hover:border-white px-3 py-1.5 rounded-sm transition-colors">Mark Progress</button>
                      <button onClick={() => updateStatus(fb._id, 'Resolved', resolutionForms[fb._id])} className="text-[10px] uppercase tracking-widest bg-white text-black px-3 py-1.5 rounded-sm hover:bg-neutral-200 transition-colors">Mark Resolved</button>
                      <button onClick={() => setResolutionForms({ ...resolutionForms, [fb._id]: undefined })} className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-neutral-400 px-2 py-1.5 transition-colors">Abort</button>
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
