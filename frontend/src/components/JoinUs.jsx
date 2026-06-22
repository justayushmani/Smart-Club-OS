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
        // If no form, leave it null
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-emerald-400">Loading form...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Application Sent!</h2>
          <p className="text-gray-300">Thank you for applying to Smart Club OS. Our leads will review your profile and get back to you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-2xl mx-auto relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-fade-in-up">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400 tracking-tight mb-4">Join The Club</h1>
          <p className="text-gray-400 font-medium">Submit your profile to be considered for our next cohort.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
              <input type="text" required value={baseData.name} onChange={e => setBaseData({...baseData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
              <input type="email" required value={baseData.email} onChange={e => setBaseData({...baseData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Department</label>
              <select required value={baseData.department} onChange={e => setBaseData({...baseData, department: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-gray-200 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all [&>option]:text-gray-900">
                <option value="tech">Tech Wing</option>
                <option value="design">Design Wing</option>
                <option value="pr">PR Wing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current CGPA</label>
              <input type="number" step="0.01" min="0" max="10" required value={baseData.cgpa} onChange={e => setBaseData({...baseData, cgpa: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
            </div>
          </div>

          {formConfig?.questions?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-gray-200 mb-6">Additional Information</h3>
              {formConfig.questions.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{q.label} {q.required && <span className="text-red-400">*</span>}</label>
                  
                  {q.type === 'text' && (
                    <input type="text" required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                  )}
                  
                  {q.type === 'textarea' && (
                    <textarea required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"></textarea>
                  )}
                  
                  {q.type === 'dropdown' && (
                    <select required={q.required} value={customAnswers[q.id] || ''} onChange={e => handleCustomChange(q.id, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-gray-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [&>option]:text-gray-900">
                      <option value="" disabled>Select an option</option>
                      {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-4 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex justify-center items-center">
            {submitting ? 'Submitting...' : <><Send className="w-5 h-5 mr-2" /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinUs;
