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
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto font-sans text-ink">
      <div className="flex justify-between items-end mb-10 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Form Builder</h2>
          <p className="text-sm font-mono text-neutral-600">Construct application data schemas</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="schematic-button flex items-center text-xs"
        >
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Deploy'}
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="schematic-card p-8 flex gap-8 items-start relative group transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#111111]">
            <div className="flex-1 space-y-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Field Label</label>
                  <input 
                    type="text" 
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="E.g., Portfolio URL"
                    className="schematic-input w-full text-lg pb-2"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Data Type</label>
                  <select 
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="schematic-input w-full text-sm pb-2 appearance-none"
                  >
                    <option value="text" className="bg-paper">Short String</option>
                    <option value="textarea" className="bg-paper">Long Text</option>
                    <option value="dropdown" className="bg-paper">Dropdown Enum</option>
                  </select>
                </div>
              </div>

              {q.type === 'dropdown' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-3">Enum Values (CSV)</label>
                  <input 
                    type="text" 
                    value={q.options.join(', ')}
                    onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="React, Vue, Angular"
                    className="schematic-input w-full text-sm pb-2"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <input 
                  type="checkbox" 
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  id={`req-${q.id}`}
                  className="appearance-none w-4 h-4 border-2 border-ink rounded-none checked:bg-blueprint checked:border-blueprint cursor-pointer transition-colors shadow-[2px_2px_0_0_#111111]"
                />
                <label htmlFor={`req-${q.id}`} className="text-xs font-mono font-bold text-neutral-600 tracking-widest uppercase cursor-pointer">Required constraint</label>
              </div>
            </div>
            <button 
              onClick={() => removeQuestion(q.id)}
              className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-8 border-2 border-dashed border-ink hover:bg-neutral-100 text-ink transition-all text-sm font-mono font-bold tracking-widest uppercase flex justify-center items-center"
        >
          <Plus className="w-5 h-5 mr-3" /> Add Field
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
