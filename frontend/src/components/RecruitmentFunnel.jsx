import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecruitmentFunnel = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/recruits');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const advanceStage = async (id, currentStage) => {
    const stages = ['applied', 'test', 'interview', 'selected'];
    const nextStage = stages[stages.indexOf(currentStage) + 1];
    if (!nextStage) return;

    try {
      const res = await api.patch(`/recruits/${id}`, { stage: nextStage });
      setCandidates(candidates.map(c => c._id === id ? res.data : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage');
    }
  };

  const renderCol = (title, stage) => {
    const colCandidates = candidates.filter(c => c.stage === stage);
    return (
      <div className="flex-1 min-w-[320px] border-2 border-ink bg-white rounded-none p-4 flex flex-col shadow-[4px_4px_0_0_#111111] mb-2 relative">
        <div className="flex justify-between items-center mb-6 pt-2 border-b-2 border-ink pb-3">
          <h3 className="text-[11px] font-mono font-bold text-ink uppercase tracking-widest">{title}</h3>
          <span className="text-[10px] font-mono text-blueprint bg-blueprint/10 px-2 py-0.5 border-2 border-blueprint">{colCandidates.length} applicants</span>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pb-4 pr-1">
          {colCandidates.map(cand => {
            const canModify = user.role !== 'member' && (user.role === 'president' || cand.domain === user.department);
            const isMovingToSelected = stage === 'interview';
            const showAdvanceBtn = canModify && stage !== 'selected' && (!isMovingToSelected || user.role === 'president');

            return (
              <div key={cand._id} className="group relative schematic-card p-4 flex flex-col mb-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono tracking-widest text-blueprint bg-blueprint/5 px-1.5 py-0.5 border border-blueprint/20 uppercase">
                    {cand.domain}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-ink mb-1 font-mono">{cand.name}</h4>
                <p className="text-xs text-neutral-600 mb-2 font-mono">{cand.email}</p>
                <div className="flex items-center text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-widest mt-2 border-t-2 border-ink pt-2">
                  <span>CGPA: <span className="text-blueprint ml-1">{cand.cgpa}</span></span>
                </div>
                {showAdvanceBtn && (
                  <button onClick={() => advanceStage(cand._id, cand.stage)} className="schematic-button w-full mt-4 text-[10px]">
                    {isMovingToSelected ? 'Onboard Member' : 'Advance to Next Stage'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto font-sans text-ink">
      <div className="mb-8 border-b-2 border-ink pb-6">
        <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Recruitment Funnel</h2>
        <p className="text-sm font-mono text-neutral-600">Track and manage applicant progression</p>
      </div>

      <div className="flex gap-6 flex-1 overflow-x-auto pb-4">
        {renderCol('Applied', 'applied')}
        {renderCol('Test', 'test')}
        {renderCol('Interview', 'interview')}
        {renderCol('Selected', 'selected')}
      </div>
    </div>
  );
};

export default RecruitmentFunnel;
