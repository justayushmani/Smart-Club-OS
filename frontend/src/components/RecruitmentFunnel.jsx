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
      <div className="flex-1 bg-white p-4 rounded-xl shadow border border-gray-200">
        <h3 className="font-bold text-center border-b pb-2 mb-4 capitalize text-gray-700">{title} ({colCandidates.length})</h3>
        <div className="space-y-3">
          {colCandidates.map(cand => {
            const canModify = user.role !== 'member' && (user.role === 'president' || cand.domain === user.department);
            const isMovingToSelected = stage === 'interview';
            const showAdvanceBtn = canModify && stage !== 'selected' && (!isMovingToSelected || user.role === 'president');

            return (
              <div key={cand._id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900">{cand.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded-full uppercase">{cand.domain}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{cand.email} • CGPA: {cand.cgpa}</p>
                {showAdvanceBtn && (
                  <button onClick={() => advanceStage(cand._id, cand.stage)} className="w-full py-1.5 mt-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition-colors">
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
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Recruitment Funnel</h2>
        <p className="text-gray-500">Track and manage applicant progression</p>
      </div>

      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {renderCol('Applied', 'applied')}
        {renderCol('Test', 'test')}
        {renderCol('Interview', 'interview')}
        {renderCol('Selected', 'selected')}
      </div>
    </div>
  );
};

export default RecruitmentFunnel;
