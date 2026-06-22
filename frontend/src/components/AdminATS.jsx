import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Calendar, Star, X, Check, FileText } from 'lucide-react';

const AdminATS = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  
  // Drawer states
  const [evalScore, setEvalScore] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  
  const [schedDate, setSchedDate] = useState('');
  const [schedMode, setSchedMode] = useState('online');
  const [schedLink, setSchedLink] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candRes, formRes] = await Promise.all([
        api.get('/recruitment/candidates'),
        api.get('/recruitment/form/public').catch(() => ({ data: null }))
      ]);
      setCandidates(candRes.data);
      if (formRes.data) setFormConfig(formRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getAvgScore = (evaluations) => {
    if (!evaluations || evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / evaluations.length).toFixed(1);
  };

  const advanceStage = async (id, stage) => {
    try {
      const res = await api.patch(`/recruitment/candidates/${id}/stage`, { stage });
      setCandidates(candidates.map(c => c._id === id ? res.data : c));
      if (selectedCandidate?._id === id) setSelectedCandidate(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage');
    }
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/recruitment/candidates/${selectedCandidate._id}/evaluate`, {
        score: Number(evalScore),
        comments: evalComment
      });
      setCandidates(candidates.map(c => c._id === res.data._id ? res.data : c));
      setSelectedCandidate(res.data);
      setEvalScore(5);
      setEvalComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving evaluation');
    }
  };

  const scheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/recruitment/candidates/${selectedCandidate._id}/schedule`, {
        date: schedDate,
        mode: schedMode,
        linkOrLocation: schedLink
      });
      setCandidates(candidates.map(c => c._id === res.data._id ? res.data : c));
      setSelectedCandidate(res.data);
      setSchedDate('');
      setSchedLink('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling interview');
    }
  };

  const renderCol = (title, stage) => {
    const colCands = candidates.filter(c => c.stage === stage);
    return (
      <div className="flex-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-200 flex flex-col min-w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">{title}</h3>
          <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full border border-gray-200">{colCands.length}</span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {colCands.map(cand => {
            const avgScore = getAvgScore(cand.evaluations);
            return (
              <div 
                key={cand._id} 
                onClick={() => setSelectedCandidate(cand)}
                className="bg-white p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cand.name}</span>
                  {avgScore > 0 && (
                    <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <Star className="w-3 h-3 mr-1 fill-amber-500" /> {avgScore}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{cand.email}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium uppercase">{cand.department}</span>
                  <span className="font-semibold text-gray-700">CGPA: {cand.cgpa}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Applicant Tracking System</h2>
        <p className="text-gray-500">Manage candidates, evaluate profiles, and schedule interviews.</p>
      </div>

      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {renderCol('New Applied', 'Applied')}
        {renderCol('Shortlisted', 'Shortlisted')}
        {renderCol('Interview Scheduled', 'Interview')}
        {renderCol('Selected (Onboarded)', 'Selected')}
      </div>

      {/* Drawer */}
      {selectedCandidate && (
        <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-gray-200 flex flex-col transform transition-transform duration-300 animate-fade-in-up z-50">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h2>
              <p className="text-sm text-gray-500">{selectedCandidate.email} • {selectedCandidate.department.toUpperCase()}</p>
            </div>
            <button onClick={() => setSelectedCandidate(null)} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Custom Answers */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><FileText className="w-4 h-4 mr-2" /> Application Details</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">CGPA</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCandidate.cgpa}</p>
                </div>
                {selectedCandidate.answers?.map(ans => {
                  const qLabel = formConfig?.questions?.find(q => q.id === ans.questionId)?.label || 'Custom Question';
                  return (
                    <div key={ans._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">{qLabel}</p>
                      <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{ans.value}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Evaluations */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><Star className="w-4 h-4 mr-2" /> Evaluations</h3>
              {selectedCandidate.evaluations?.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {selectedCandidate.evaluations.map((ev, i) => (
                    <div key={i} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-800">{ev.reviewerName}</span>
                        <span className="text-xs font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">Score: {ev.score}/10</span>
                      </div>
                      <p className="text-sm text-blue-900">{ev.comments}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 mb-4">No evaluations yet.</p>}

              {user.role !== 'member' && (
                <form onSubmit={submitEvaluation} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">Add Evaluation</h4>
                  <div className="flex gap-4 mb-3">
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Score (1-10)</label>
                      <input type="number" min="1" max="10" required value={evalScore} onChange={e => setEvalScore(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Comments</label>
                      <input type="text" required value={evalComment} onChange={e => setEvalComment(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" placeholder="Strengths, weaknesses..." />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded text-sm font-bold hover:bg-gray-800 transition-colors">Submit Evaluation</button>
                </form>
              )}
            </section>

            {/* Interview Scheduler */}
            {user.role !== 'member' && selectedCandidate.stage !== 'Selected' && (
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Interview Schedule</h3>
                {selectedCandidate.interviewSchedule?.date && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-4">
                    <p className="text-xs text-emerald-600 font-bold mb-1">Scheduled for: {new Date(selectedCandidate.interviewSchedule.date).toLocaleString()}</p>
                    <p className="text-sm text-emerald-800">Mode: {selectedCandidate.interviewSchedule.mode.toUpperCase()}</p>
                    <p className="text-sm text-emerald-800">Location/Link: <a href={selectedCandidate.interviewSchedule.linkOrLocation} target="_blank" className="underline">{selectedCandidate.interviewSchedule.linkOrLocation}</a></p>
                  </div>
                )}
                
                <form onSubmit={scheduleInterview} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">{selectedCandidate.interviewSchedule?.date ? 'Reschedule Interview' : 'Schedule Interview'}</h4>
                  <div className="space-y-3 mb-3">
                    <input type="datetime-local" required value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500" />
                    <div className="flex gap-2">
                      <select value={schedMode} onChange={e => setSchedMode(e.target.value)} className="w-1/3 border rounded p-2 text-sm outline-none focus:border-blue-500">
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                      <input type="text" required value={schedLink} onChange={e => setSchedLink(e.target.value)} placeholder="Zoom link or Room Number" className="flex-1 border rounded p-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors">Confirm Schedule</button>
                </form>
              </section>
            )}

            {/* Stage Transitions */}
            {user.role !== 'member' && (
              <section className="pb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center"><UserCircle className="w-4 h-4 mr-2" /> Pipeline Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCandidate.stage === 'Applied' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Shortlisted')} className="col-span-2 bg-indigo-50 text-indigo-600 border border-indigo-200 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">Move to Shortlisted</button>
                  )}
                  {selectedCandidate.stage === 'Shortlisted' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Interview')} className="col-span-2 bg-blue-50 text-blue-600 border border-blue-200 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">Move to Interview</button>
                  )}
                  {selectedCandidate.stage !== 'Selected' && selectedCandidate.stage !== 'Rejected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Rejected')} className="bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">Reject Candidate</button>
                  )}
                  
                  {user.role === 'president' && selectedCandidate.stage !== 'Selected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Selected')} className="bg-emerald-600 text-white shadow border border-emerald-500 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors col-span-2 flex items-center justify-center">
                      <Check className="w-4 h-4 mr-2" /> Onboard as Core Member
                    </button>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminATS;
