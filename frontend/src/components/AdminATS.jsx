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
      <div className="flex-1 min-w-[280px] flex flex-col px-4 border-r-2 border-ink last:border-r-0">
        <div className="flex justify-between items-center mb-6 pt-2 border-b-2 border-ink pb-3">
          <h3 className="text-[10px] font-bold font-mono text-ink uppercase tracking-widest">{title}</h3>
          <span className="text-[10px] font-mono text-blueprint bg-blueprint/10 px-2 py-0.5 border-2 border-blueprint font-bold">{colCands.length} items</span>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pb-6 pr-2">
          {colCands.map(cand => {
            const avgScore = getAvgScore(cand.evaluations);
            return (
              <div 
                key={cand._id} 
                onClick={() => setSelectedCandidate(cand)}
                className="schematic-card p-4 cursor-pointer group flex flex-col mb-4 bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-paper border-2 border-ink flex items-center justify-center text-[10px] font-bold text-ink">
                      {cand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink group-hover:text-blueprint transition-colors font-mono">{cand.name}</h4>
                      <p className="text-[10px] text-neutral-600 font-mono">{cand.email}</p>
                    </div>
                  </div>
                  {avgScore > 0 && (
                    <span className="flex items-center text-[9px] text-blueprint font-bold">
                      <Star className="w-3 h-3 mr-1 fill-blueprint/20 stroke-blueprint" /> {avgScore}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-4 border-t-2 border-ink">
                  <span className="font-mono text-[9px] text-blueprint bg-blueprint/5 px-1.5 py-0.5 border-2 border-blueprint font-bold">
                    {`{"dept":"${cand.department}"}`}
                  </span>
                  <div className="w-1/2 flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-mono text-neutral-500 font-bold">CGPA</span>
                    <div className="flex-1 h-1.5 bg-neutral-200 overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-blueprint" style={{ width: `${(cand.cgpa / 10) * 100}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono text-blueprint font-bold">{cand.cgpa}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden max-w-[1400px] mx-auto font-sans text-ink">
      <div className="flex justify-between items-end mb-8 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Recruitment Funnel</h2>
          <p className="text-sm font-mono text-neutral-600">~/applicant_tracking_and_evaluation</p>
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
        <div className="absolute top-0 right-0 h-full w-[450px] bg-paper shadow-[-8px_0_0_0_#111111] border-l-2 border-ink flex flex-col transform transition-transform duration-300 z-50">
          <div className="p-6 border-b-2 border-ink flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border-2 border-ink flex items-center justify-center text-sm font-bold text-ink shadow-[2px_2px_0_0_#111111]">
                {selectedCandidate.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-ink font-mono text-lg">{selectedCandidate.name}</h3>
                <p className="text-xs text-neutral-500 font-mono font-bold tracking-widest">{selectedCandidate.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCandidate(null)} className="text-neutral-500 hover:text-ink transition-colors mt-1 font-bold">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            
            {/* Application Data */}
            <section>
              <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Application Details
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b-2 border-ink pb-3">
                  <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest">CGPA</span>
                  <span className="text-sm font-mono font-bold text-ink">{selectedCandidate.cgpa}</span>
                </div>
                {selectedCandidate.answers?.map(ans => {
                  const qLabel = formConfig?.questions?.find(q => q.id === ans.questionId)?.label || 'Custom Question';
                  return (
                    <div key={ans._id} className="border-b-2 border-ink pb-4">
                      <p className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">{qLabel}</p>
                      <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed font-sans">{ans.value}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Evaluations */}
            <section>
              <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                <Star className="w-4 h-4 mr-2" /> Evaluations
              </h3>
              {selectedCandidate.evaluations?.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {selectedCandidate.evaluations.map((ev, i) => (
                    <div key={i} className="schematic-card-flat p-4 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-widest">{ev.reviewerName}</span>
                        <span className="text-[10px] font-mono font-bold text-blueprint bg-blueprint/5 px-2 py-0.5 border-2 border-blueprint">
                          {ev.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-ink font-sans leading-relaxed">{ev.comments}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-neutral-600 mb-6 italic font-mono uppercase tracking-widest">No evaluations recorded yet.</p>}

              {user.role !== 'member' && (
                <form onSubmit={submitEvaluation} className="space-y-4 pt-4 border-t-2 border-ink">
                  <h4 className="text-[10px] text-blueprint font-mono font-bold uppercase tracking-widest mb-2">$ ./add_evaluation</h4>
                  <div className="flex gap-4">
                    <div className="w-20">
                      <label className="block text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider mb-2">Score</label>
                      <input type="number" min="1" max="10" required value={evalScore} onChange={e => setEvalScore(e.target.value)} className="schematic-input w-full text-center pb-2 text-sm text-ink bg-transparent" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider mb-2">Comments</label>
                      <input type="text" required value={evalComment} onChange={e => setEvalComment(e.target.value)} className="schematic-input w-full pb-2 text-sm text-ink bg-transparent" placeholder="Strengths, red flags..." />
                    </div>
                  </div>
                  <button type="submit" className="schematic-button mt-4 text-[10px]">
                    Submit Score
                  </button>
                </form>
              )}
            </section>

            {/* Schedule */}
            {user.role !== 'member' && selectedCandidate.stage !== 'Selected' && (
              <section>
                <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Interview Schedule
                </h3>
                {selectedCandidate.interviewSchedule?.date && (
                  <div className="schematic-card-flat border-blueprint/50 p-4 mb-6 bg-white">
                    <p className="text-[10px] text-blueprint font-mono font-bold uppercase tracking-widest mb-2">
                      Scheduled: {new Date(selectedCandidate.interviewSchedule.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-ink mb-1 font-mono font-bold uppercase tracking-widest">Mode: <span className="uppercase text-[10px] tracking-wider text-neutral-500 ml-1">{selectedCandidate.interviewSchedule.mode}</span></p>
                    <p className="text-xs text-ink font-mono font-bold uppercase tracking-widest">Link/Loc: <a href={selectedCandidate.interviewSchedule.linkOrLocation} target="_blank" className="text-blueprint hover:underline ml-1">{selectedCandidate.interviewSchedule.linkOrLocation}</a></p>
                  </div>
                )}
                
                <form onSubmit={scheduleInterview} className="space-y-4 pt-4 border-t-2 border-ink">
                  <h4 className="text-[10px] text-blueprint font-mono font-bold uppercase tracking-widest mb-2">$ ./configure_schedule</h4>
                  <div className="space-y-4">
                    <input type="datetime-local" required value={schedDate} onChange={e => setSchedDate(e.target.value)} className="schematic-input w-full pb-2 text-sm text-ink bg-transparent" />
                    <div className="flex gap-4">
                      <select value={schedMode} onChange={e => setSchedMode(e.target.value)} className="schematic-input w-1/3 pb-2 text-sm text-ink appearance-none font-bold bg-transparent">
                        <option value="online" className="bg-paper">Online</option>
                        <option value="offline" className="bg-paper">Offline</option>
                      </select>
                      <input type="text" required value={schedLink} onChange={e => setSchedLink(e.target.value)} placeholder="Zoom link or Room" className="schematic-input flex-1 pb-2 text-sm text-ink bg-transparent" />
                    </div>
                  </div>
                  <button type="submit" className="schematic-button mt-4 text-[10px]">
                    {selectedCandidate.interviewSchedule?.date ? 'Reschedule' : 'Set Schedule'}
                  </button>
                </form>
              </section>
            )}

            {/* Actions */}
            {user.role !== 'member' && (
              <section className="pb-8">
                <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
                  <UserCircle className="w-4 h-4 mr-2" /> Pipeline Actions
                </h3>
                <div className="flex flex-col gap-4 font-mono font-bold uppercase tracking-widest text-[10px]">
                  {selectedCandidate.stage === 'Applied' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Shortlisted')} className="schematic-button w-full">Move to Shortlisted</button>
                  )}
                  {selectedCandidate.stage === 'Shortlisted' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Interview')} className="schematic-button w-full">Move to Interview</button>
                  )}
                  {user.role === 'president' && selectedCandidate.stage !== 'Selected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Selected')} className="schematic-button w-full">
                      Onboard Candidate
                    </button>
                  )}
                  {selectedCandidate.stage !== 'Selected' && selectedCandidate.stage !== 'Rejected' && (
                    <button onClick={() => advanceStage(selectedCandidate._id, 'Rejected')} className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-2 px-4 shadow-[2px_2px_0_0_#ef4444] hover:shadow-[0px_0px_0_0_#ef4444] hover:translate-y-[2px] hover:translate-x-[2px] transition-all text-center">
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
