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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paper text-ink text-[10px] uppercase tracking-widest font-mono font-bold">Loading schema...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-mono">
        <div className="schematic-card p-10 text-center max-w-sm">
          <div className="w-16 h-16 border-2 border-ink rounded-none flex items-center justify-center mx-auto mb-8 bg-white shadow-[4px_4px_0_0_#111111]">
            <CheckCircle className="w-8 h-8 text-blueprint" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Application Received</h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans mt-4">Your profile has been indexed into the recruitment ATS. Club leads will contact you if shortlisted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink py-16 px-4 font-sans">
      <div className="max-w-2xl mx-auto schematic-card p-10">
        <div className="mb-12 border-b-2 border-ink pb-6">
          <h1 className="font-bold tracking-widest uppercase text-ink text-3xl flex flex-col gap-2">
            TECHNOVATION
            <span className="text-[10px] text-neutral-500 font-mono font-bold tracking-widest uppercase">Recruitment Portal</span>
          </h1>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-500 text-red-600 px-4 py-3 text-xs mb-8 font-mono font-bold shadow-[2px_2px_0_0_#ef4444]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Full Legal Name</label>
              <input type="text" required value={baseData.name} onChange={e => setBaseData({...baseData, name: e.target.value})} className="schematic-input w-full text-lg pb-2" />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Email Address</label>
              <input type="email" required value={baseData.email} onChange={e => setBaseData({...baseData, email: e.target.value})} className="schematic-input w-full text-lg pb-2" />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Target Wing</label>
              <select required value={baseData.department} onChange={e => setBaseData({...baseData, department: e.target.value})} className="schematic-input w-full text-lg pb-2 appearance-none">
                <option value="tech" className="bg-paper">Tech Engineering</option>
                <option value="design" className="bg-paper">Product Design</option>
                <option value="pr" className="bg-paper">Public Relations</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Current CGPA</label>
              <input type="number" step="0.01" min="0" max="10" required value={baseData.cgpa} onChange={e => setBaseData({...baseData, cgpa: e.target.value})} className="schematic-input w-full text-lg pb-2" />
            </div>
          </div>

          {formConfig?.questions?.length > 0 && (
            <div className="pt-8 border-t-2 border-ink space-y-8 mt-12">
              <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-6">Extended Questionnaire</h3>
              {formConfig.questions.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-bold text-ink mb-3">{q.label} {q.required && <span className="text-red-500 ml-1">*</span>}</label>
                  
                  {q.type === 'text' && (
                    <input type="text" required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="schematic-input w-full text-sm pb-2" />
                  )}
                  
                  {q.type === 'textarea' && (
                    <textarea required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} rows="3" className="schematic-input w-full text-sm pb-2 resize-none"></textarea>
                  )}
                  
                  {q.type === 'dropdown' && (
                    <select required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="schematic-input w-full text-sm pb-2 appearance-none">
                      <option value="" disabled className="bg-paper">Select response...</option>
                      {q.options.map(opt => <option key={opt} value={opt} className="bg-paper">{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-10 flex justify-end">
            <button type="submit" disabled={submitting} className="schematic-button flex items-center text-xs">
              {submitting ? 'Transmitting...' : <><Send className="w-4 h-4 mr-2" /> Dispatch Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinUs;
