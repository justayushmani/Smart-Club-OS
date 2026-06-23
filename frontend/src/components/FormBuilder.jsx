import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';

const FormBuilder = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.get('/recruitment/form/public');
        if (res.data && res.data.questions) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.log('No active form found to prepopulate.');
      }
    };
    fetchForm();
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        label: '',
        type: 'text',
        options: [],
        required: true
      }
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/recruitment/form', { questions });
      alert('Form template saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-10 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Form Builder</h2>
          <p className="text-xs text-neutral-500">Construct application data schemas</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-white hover:bg-neutral-200 text-black px-4 py-1.5 text-xs font-medium rounded transition-colors flex items-center"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" /> {loading ? 'Saving...' : 'Deploy'}
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-[#161617] p-8 rounded-sm border-[0.5px] border-[#2c2c2e] flex gap-8 items-start relative group transition-all hover:bg-neutral-800/40 hover:border-neutral-700">
            <div className="flex-1 space-y-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Field Label</label>
                  <input 
                    type="text" 
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="E.g., Portfolio URL"
                    className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Data Type</label>
                  <select 
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors appearance-none"
                  >
                    <option value="text" className="bg-[#0a0a0a]">Short String</option>
                    <option value="textarea" className="bg-[#0a0a0a]">Long Text</option>
                    <option value="dropdown" className="bg-[#0a0a0a]">Dropdown Enum</option>
                  </select>
                </div>
              </div>

              {q.type === 'dropdown' && (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Enum Values (CSV)</label>
                  <input 
                    type="text" 
                    value={q.options.join(', ')}
                    onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="React, Vue, Angular"
                    className="w-full bg-transparent border-b border-[#2c2c2e] focus:border-white focus:outline-none text-white pb-2 text-sm transition-colors"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  id={`req-${q.id}`}
                  className="appearance-none w-3.5 h-3.5 border border-[#2c2c2e] rounded-sm checked:bg-white checked:border-white cursor-pointer transition-colors"
                />
                <label htmlFor={`req-${q.id}`} className="text-xs text-neutral-500 tracking-wide uppercase cursor-pointer">Required constraint</label>
              </div>
            </div>
            <button 
              onClick={() => removeQuestion(q.id)}
              className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-6 border-[0.5px] border-dashed border-[#2c2c2e] hover:border-neutral-600 rounded-sm text-neutral-500 hover:text-white transition-all text-xs font-medium tracking-wide uppercase flex justify-center items-center"
        >
          <Plus className="w-3.5 h-3.5 mr-2" /> Add Field
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
