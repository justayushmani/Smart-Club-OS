import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';

const FormBuilder = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch existing form to prepopulate
    const fetchForm = async () => {
      try {
        const res = await api.get('/recruitment/form/public');
        if (res.data && res.data.questions) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        // If 404, it means no form exists yet, which is fine
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
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Application Form Builder</h2>
          <p className="text-gray-500">Design the custom questions for new applicants</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center shadow-lg transition-all font-semibold"
        >
          <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start relative group">
            <div className="flex-1 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Label</label>
                  <input 
                    type="text" 
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                    placeholder="e.g., Why do you want to join?"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer Type</label>
                  <select 
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Paragraph</option>
                    <option value="dropdown">Dropdown Options</option>
                  </select>
                </div>
              </div>

              {q.type === 'dropdown' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dropdown Options (Comma separated)</label>
                  <input 
                    type="text" 
                    value={q.options.join(', ')}
                    onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  id={`req-${q.id}`}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor={`req-${q.id}`} className="text-sm text-gray-600">Required field</label>
              </div>
            </div>
            <button 
              onClick={() => removeQuestion(q.id)}
              className="text-red-400 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all font-bold flex justify-center items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Question
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
