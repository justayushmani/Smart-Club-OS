import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Send, CheckCircle } from 'lucide-react';

const JoinUs = () => {
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [baseData, setBaseData] = useState({
    name: '',
    email: '',
    department: 'tech',
    cgpa: ''
  });
  const [customAnswers, setCustomAnswers] = useState({});

  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const res = await api.get('/recruitment/form/public');
        setFormConfig(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormConfig();
  }, []);

  const handleCustomChange = (id, value) => {
    setCustomAnswers({ ...customAnswers, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const answersArray = formConfig?.questions.map(q => ({
        questionId: q.id,
        value: customAnswers[q.id] || ''
      })) || [];

      const payload = {
        ...baseData,
        cgpa: Number(baseData.cgpa),
        answers: answersArray
      };

      await api.post('/recruitment/apply', payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-neutral-500 text-[10px] uppercase tracking-widest">Loading schema...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 border border-[#2c2c2e] rounded-full flex items-center justify-center mx-auto mb-8 bg-[#161617]">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Application Received</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">Your profile has been indexed into the recruitment ATS. Club leads will contact you if shortlisted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-16 px-4 font-sans selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="font-bold tracking-widest uppercase text-white text-lg flex flex-col gap-1">
            TECHNOVATION
            <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-medium">Recruitment Portal</span>
          </h1>
        </div>

        {error && <div className="bg-[#161617] border border-red-900/30 text-red-400 px-4 py-3 text-xs mb-8">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Full Legal Name</label>
              <input type="text" required value={baseData.name} onChange={e => setBaseData({...baseData, name: e.target.value})} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Email Address</label>
              <input type="email" required value={baseData.email} onChange={e => setBaseData({...baseData, email: e.target.value})} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Target Wing</label>
              <select required value={baseData.department} onChange={e => setBaseData({...baseData, department: e.target.value})} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors appearance-none">
                <option value="tech" className="bg-[#0a0a0a]">Tech Engineering</option>
                <option value="design" className="bg-[#0a0a0a]">Product Design</option>
                <option value="pr" className="bg-[#0a0a0a]">Public Relations</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Current CGPA</label>
              <input type="number" step="0.01" min="0" max="10" required value={baseData.cgpa} onChange={e => setBaseData({...baseData, cgpa: e.target.value})} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
            </div>
          </div>

          {formConfig?.questions?.length > 0 && (
            <div className="pt-8 border-t border-[#2c2c2e] space-y-8 mt-12">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">Extended Questionnaire</h3>
              {formConfig.questions.map(q => (
                <div key={q.id}>
                  <label className="block text-sm text-neutral-300 mb-3">{q.label} {q.required && <span className="text-neutral-600">*</span>}</label>
                  
                  {q.type === 'text' && (
                    <input type="text" required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors" />
                  )}
                  
                  {q.type === 'textarea' && (
                    <textarea required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} rows="3" className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors resize-none"></textarea>
                  )}
                  
                  {q.type === 'dropdown' && (
                    <select required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors appearance-none">
                      <option value="" disabled className="bg-[#0a0a0a]">Select response...</option>
                      {q.options.map(opt => <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-10 flex justify-end">
            <button type="submit" disabled={submitting} className="bg-white text-black px-6 py-2.5 text-xs font-medium hover:bg-neutral-200 transition-colors flex justify-center items-center">
              {submitting ? 'Transmitting...' : <><Send className="w-4 h-4 mr-2" /> Dispatch Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinUs;
