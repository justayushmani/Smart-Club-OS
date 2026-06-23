import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Calendar, Star, X, FileText } from 'lucide-react';

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
      <div className="flex-1 min-w-[280px] flex flex-col px-4 border-r border-[#2c2c2e] last:border-r-0">
        <div className="flex justify-between items-center mb-6 pt-2">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
          <span className="text-[10px] text-neutral-600">{colCands.length}</span>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pb-6 pr-2">
          {colCands.map(cand => {
            const avgScore = getAvgScore(cand.evaluations);
            return (
              <div 
                key={cand._id} 
                onClick={() => setSelectedCandidate(cand)}
                className="bg-[#161617] p-4 border-[0.5px] border-[#2c2c2e] rounded-md transition-all duration-150 ease-in-out hover:bg-neutral-800/40 hover:border-neutral-700 cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center text-[10px] font-medium text-neutral-400">
                      {cand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-neutral-200 group-hover:text-white transition-colors">{cand.name}</h4>
                      <p className="text-[10px] text-neutral-500">{cand.email}</p>
                    </div>
                  </div>
                  {avgScore > 0 && (
                    <span className="flex items-center text-[9px] text-indigo-400">
                      <Star className="w-3 h-3 mr-1 fill-indigo-400/20 stroke-indigo-400" /> {avgScore}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-[#2c2c2e]/50">
                  <span className="text-[9px] border border-neutral-800 text-neutral-500 bg-transparent px-1.5 py-0.5 uppercase tracking-wider rounded-sm">
                    {cand.department}
                  </span>
                  <span className="text-[10px] text-neutral-500 tracking-wide font-medium">CGPA <span className="text-neutral-300">{cand.cgpa}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Recruitment Funnel</h2>
          <p className="text-xs text-neutral-500">Applicant tracking and evaluation matrix</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-x-auto pb-4">
        {renderCol('Applied', 'Applied')}
        {renderCol('Shortlisted', 'Shortlisted')}
        {renderCol('Interviewing', 'Interview')}
        {renderCol('Onboarded', 'Selected')}
      </div>

      {/* Side Drawer */}
      {selectedCandidate && (
        <div className="absolute top-0 right-0 h-full w-[450px] bg-[#0a0a0a] shadow-2xl border-l border-[#2c2c2e] flex flex-col transform transition-transform duration-300 z-50">
          <div className="p-6 border-b border-[#2c2c2e] flex justify-between items-start bg-[#0a0a0a]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-[#161617] border border-[#2c2c2e] flex items-center justify-center text-sm font-medium text-neutral-300">
                {selectedCandidate.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-medium text-white mb-1">{selectedCandidate.name}</h2>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-neutral-500 tracking-widest uppercase">{selectedCandidate.department}</span>
                  <span className="text-[10px] text-neutral-700">•</span>
                  <span className="text-[10px] text-neutral-500">{selectedCandidate.email}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedCandidate(null)} className="p-1 text-neutral-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-[#0a0a0a]">
            
            {/* Application Data */}
            <section>
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                <FileText className="w-3 h-3 mr-2" /> Application Details
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#2c2c2e] pb-3">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">CGPA</span>
                  <span className="text-sm font-medium text-white">{selectedCandidate.cgpa}</span>
                </div>
                {selectedCandidate.answers?.map(ans => {
                  const qLabel = formConfig?.questions?.find(q => q.id === ans.questionId)?.label || 'Custom Question';
                  return (
                    <div key={ans._id} className="border-b border-[#2c2c2e] pb-4">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">{qLabel}</p>
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{ans.value}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Evaluations */}
            <section>
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                <Star className="w-3 h-3 mr-2" /> Evaluations
              </h3>
              {selectedCandidate.evaluations?.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {selectedCandidate.evaluations.map((ev, i) => (
                    <div key={i} className="bg-[#161617] p-4 rounded-sm border-[0.5px] border-[#2c2c2e]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{ev.reviewerName}</span>
                        <span className="text-[10px] font-medium text-white bg-[#1c1c1e] px-2 py-0.5 rounded border border-[#2c2c2e]">
                          {ev.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{ev.comments}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-neutral-600 mb-6 italic">No evaluations recorded yet.</p>}

              {user.role !== 'member' && (
                <form onSubmit={submitEvaluation} className="space-y-4 pt-4 border-t border-[#2c2c2e]">
                  <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Add Evaluation</h4>
                  <div className="flex gap-4">
                    <div className="w-20">
                      <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Score</label>
                      <input type="number" min="1" max="10" required value={evalScore} onChange={e => setEvalScore(e.target.value)} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors text-center" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Comments</label>
                      <input type="text" required value={evalComment} onChange={e => setEvalComment(e.target.value)} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" placeholder="Strengths, red flags..." />
                    </div>
                  </div>
                  <button type="submit" className="border border-neutral-800 hover:border-white text-neutral-400 hover:text-white px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-widest transition-all mt-2">
                    Submit Score
                  </button>
                </form>
              )}
            </section>

            {/* Schedule */}
            {user.role !== 'member' && selectedCandidate.stage !== 'Selected' && (
              <section>
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                  <Calendar className="w-3 h-3 mr-2" /> Interview Schedule
                </h3>
                {selectedCandidate.interviewSchedule?.date && (
                  <div className="bg-[#161617] border-[0.5px] border-indigo-500/30 p-4 rounded-sm mb-6">
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-2">
                      Scheduled: {new Date(selectedCandidate.interviewSchedule.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-neutral-300 mb-1">Mode: <span className="uppercase text-[10px] tracking-wider text-neutral-500 ml-1">{selectedCandidate.interviewSchedule.mode}</span></p>
                    <p className="text-xs text-neutral-300">Link/Loc: <a href={selectedCandidate.interviewSchedule.linkOrLocation} target="_blank" className="text-indigo-400 hover:underline">{selectedCandidate.interviewSchedule.linkOrLocation}</a></p>
                  </div>
                )}
                
                <form onSubmit={scheduleInterview} className="space-y-4 pt-4 border-t border-[#2c2c2e]">
                  <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Configure Schedule</h4>
                  <div className="space-y-4">
                    <input type="datetime-local" required value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
                    <div className="flex gap-4">
                      <select value={schedMode} onChange={e => setSchedMode(e.target.value)} className="w-1/3 bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors appearance-none">
                        <option value="online" className="bg-[#0a0a0a]">Online</option>
                        <option value="offline" className="bg-[#0a0a0a]">Offline</option>
                      </select>
                      <input type="text" required value={schedLink} onChange={e => setSchedLink(e.target.value)} placeholder="Zoom link or Room" className="flex-1 bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
                    </div>
                  </div>
                  <button type="submit" className="border border-neutral-800 hover:border-white text-neutral-400 hover:text-white px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-widest transition-all mt-2">
                    {selectedCandidate.interviewSchedule?.date ? 'Reschedule' : 'Set Schedule'}
                  </button>
                </form>
              </section>
            )}

            {/* Actions */}
            {user.role !== 'member' && (
              <section className="pb-8">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                  <UserCircle className="w-3 h-3 mr-2" /> Pipeline Actions
                </h3>
                <div className="flex flex-col gap-2">
                  {selectedCandidate.stage === 'Applied' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Shortlisted')} className="w-full border border-neutral-800 hover:border-white text-neutral-400 hover:text-white py-2.5 rounded-sm text-xs transition-all text-center">Move to Shortlisted</button>
                  )}
                  {selectedCandidate.stage === 'Shortlisted' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Interview')} className="w-full border border-neutral-800 hover:border-white text-neutral-400 hover:text-white py-2.5 rounded-sm text-xs transition-all text-center">Move to Interview</button>
                  )}
                  {user.role === 'president' && selectedCandidate.stage !== 'Selected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Selected')} className="w-full bg-white text-black font-medium hover:bg-neutral-200 py-2.5 rounded-sm text-xs transition-all text-center">
                      Onboard Candidate
                    </button>
                  )}
                  {selectedCandidate.stage !== 'Selected' && selectedCandidate.stage !== 'Rejected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Rejected')} className="w-full border border-red-900/50 hover:border-red-500 text-red-500/70 hover:text-red-400 py-2.5 rounded-sm text-xs transition-all text-center mt-4">
                      Reject
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
