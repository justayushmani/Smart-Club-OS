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
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto relative font-mono">
      <div className="mb-10 border-b-2 border-ink pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-ink mb-1">Feedback Registry</h2>
          <p className="text-xs text-neutral-500">~/secure_closed_loop_pipeline</p>
        </div>
      </div>

      <div className="mb-12 schematic-card flex flex-col">
        <div className="bg-drafting/30 border-b-2 border-ink px-4 py-2 flex justify-between items-center">
          <span className="text-[10px] text-blueprint uppercase tracking-widest font-bold">[SECURED FEEDBACK TUNNEL_]</span>
          <span className="w-2 h-2 bg-blueprint rounded-none shadow-[1px_1px_0_0_#111111] animate-pulse"></span>
        </div>
        <form onSubmit={submitFeedback} className="p-0 flex flex-col">
          <div className="flex">
            <div className="w-10 shrink-0 border-r-2 border-drafting bg-drafting/20 flex flex-col items-center py-4 text-[10px] text-neutral-400 select-none font-bold">
               <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
            <textarea
              required
              className="flex-1 bg-transparent text-ink p-4 text-sm focus:outline-none resize-none h-24 placeholder-neutral-400 font-mono"
              placeholder="$ echo 'Log a new concern or suggestion...'"
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <div className="flex justify-between items-center p-4 border-t-2 border-ink bg-drafting/20">
            <div className="flex items-center gap-6">
              <select className="schematic-input text-[10px] uppercase tracking-widest outline-none cursor-pointer appearance-none pb-1 font-bold" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option className="bg-paper">General</option>
                <option className="bg-paper">Facilities</option>
                <option className="bg-paper">Harassment</option>
                <option className="bg-paper">Management</option>
              </select>
              <label className="flex items-center gap-2 text-[10px] text-neutral-600 uppercase tracking-widest cursor-pointer font-bold">
                <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} className="appearance-none w-3 h-3 border-2 border-ink rounded-none checked:bg-blueprint checked:border-blueprint cursor-pointer transition-colors shadow-[1px_1px_0_0_#111111]" />
                Anon Mode
              </label>
            </div>
            <button type="submit" className="schematic-button text-[10px]">[Enter ↵] Execute</button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-bold text-ink uppercase tracking-widest mb-6">Archive</h3>
        {feedbacks.length === 0 && <p className="text-sm text-neutral-600 italic">No registry records found.</p>}
        {feedbacks.map(fb => (
          <div key={fb._id} className="schematic-card p-6 flex flex-col mb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-none flex items-center justify-center border-2 border-ink text-xs font-mono font-bold shadow-[1px_1px_0_0_#111111] ${fb.isAnonymous ? 'bg-drafting text-neutral-500' : 'bg-blueprint text-white'}`}>
                  {fb.isAnonymous ? '?' : fb.author?.username?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm font-mono">{fb.isAnonymous ? 'Anonymous' : fb.author?.username}</h4>
                  <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">{new Date(fb.createdAt).toLocaleDateString()} • {fb.category}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold font-mono tracking-widest px-2 py-0.5 border-2 ${
                fb.status === 'Resolved' ? 'bg-blueprint/10 text-blueprint border-blueprint' : 
                fb.status === 'In Progress' ? 'bg-orange-500/10 text-orange-600 border-orange-500' : 
                'bg-red-500/10 text-red-600 border-red-500'
              }`}>
                [{fb.status}]
              </span>
            </div>
            
            <p className="text-sm text-ink leading-relaxed mb-4 font-mono whitespace-pre-wrap">{fb.text}</p>

            {fb.resolutionNotes && (
              <div className="schematic-card p-4 mt-2 mb-4">
                <span className="block text-[9px] text-blueprint uppercase tracking-widest mb-2 font-mono font-bold">Resolution Output</span>
                <p className="text-sm text-neutral-700 font-sans">{fb.resolutionNotes}</p>
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
                      placeholder="$ append_resolution..." 
                      className="schematic-input w-full py-2 text-sm text-ink resize-none mb-3"
                      value={resolutionForms[fb._id] || ''}
                      onChange={e => setResolutionForms({ ...resolutionForms, [fb._id]: e.target.value })}
                    />
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => updateStatus(fb._id, 'In Progress', resolutionForms[fb._id])} className="schematic-button text-[10px]">Mark Progress</button>
                      <button onClick={() => updateStatus(fb._id, 'Resolved', resolutionForms[fb._id])} className="schematic-button text-[10px]">Mark Resolved</button>
                      <button onClick={() => setResolutionForms({ ...resolutionForms, [fb._id]: undefined })} className="schematic-button text-[10px] opacity-70">Abort</button>
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
