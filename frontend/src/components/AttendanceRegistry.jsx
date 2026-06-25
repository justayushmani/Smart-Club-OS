import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, CheckSquare, Square, Users as UsersIcon } from 'lucide-react';

const AttendanceRegistry = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', format: 'offline', attendees: [] });

  useEffect(() => {
    fetchRecords();
    if (user.role === 'president' || user.role === 'department_lead') {
      fetchMembers();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data);
    } catch (err) {
      console.error('Error fetching attendance records', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/auth/members');
      setMembers(res.data);
    } catch (err) {
      console.error('Error fetching members', err);
    }
  };

  const toggleAttendee = (memberId) => {
    setFormData(prev => {
      const isSelected = prev.attendees.includes(memberId);
      if (isSelected) {
        return { ...prev, attendees: prev.attendees.filter(id => id !== memberId) };
      } else {
        return { ...prev, attendees: [...prev.attendees, memberId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance', formData);
      setRecords([res.data, ...records].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setShowForm(false);
      setFormData({ title: '', date: '', format: 'offline', attendees: [] });
    } catch (err) {
      console.error('Error saving attendance', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/attendance/${id}`);
      setRecords(records.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting record', err);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto font-sans text-ink">
      <div className="flex justify-between items-end mb-10 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Attendance Registry</h2>
          <p className="text-sm font-mono text-neutral-600">Track and view meeting attendance records.</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="schematic-button flex items-center text-xs">
            <Plus className="w-4 h-4 mr-2" /> Mark Attendance
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="schematic-card p-6 mb-10">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-6 mb-6">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 mb-2">Meeting Title</label>
              <input type="text" placeholder="e.g. Weekly Sync" className="schematic-input w-full text-lg" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 mb-2">Date & Time</label>
              <input type="datetime-local" className="schematic-input w-full text-sm" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 mb-2">Format</label>
              <select className="schematic-input w-full text-sm appearance-none" value={formData.format} onChange={e => setFormData({ ...formData, format: e.target.value })}>
                <option value="offline">Offline / In-person</option>
                <option value="online">Online / Virtual</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 border-b-2 border-ink pb-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-ink">Select Attendees</label>
              <span className="text-xs font-mono font-bold text-blueprint">{formData.attendees.length} selected</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {members.map(member => {
                const isSelected = formData.attendees.includes(member._id);
                return (
                  <div 
                    key={member._id}
                    onClick={() => toggleAttendee(member._id)}
                    className={`flex items-center gap-3 p-3 schematic-card-flat cursor-pointer transition-colors ${isSelected ? 'bg-blueprint/10 border-blueprint' : 'hover:bg-neutral-100'}`}
                  >
                    <div className={isSelected ? 'text-blueprint' : 'text-neutral-400'}>
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink leading-tight">{member.username}</p>
                      <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-widest mt-1">{member.role} • {member.department}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t-2 border-ink font-mono">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-ink transition-colors">Cancel</button>
            <button type="submit" className="schematic-button text-xs">Save Attendance</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {records.map(record => (
          <div key={record._id} className="schematic-card-flat p-8 transition-all duration-150 ease-in-out hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#111111] group flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4 font-mono font-bold">
                <span className={`border-2 border-ink text-ink bg-transparent px-2 py-1 text-[10px] uppercase tracking-widest`}>
                  {record.format}
                </span>
                <span className="text-xs text-blueprint uppercase tracking-widest">{new Date(record.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2">{record.title}</h3>
              <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-widest">
                Recorded by <span className="text-ink ml-1">{record.recordedBy?.username}</span>
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4 md:min-w-[200px]">
              {(user.role === 'president' || user.role === 'department_lead') && (
                <button onClick={() => handleDelete(record._id)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center gap-2 text-blueprint border-2 border-blueprint px-4 py-2 bg-transparent font-mono font-bold uppercase tracking-widest">
                <UsersIcon className="w-4 h-4" />
                <span className="text-[10px]">{record.attendees?.length || 0} Attended</span>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end max-w-xs mt-2">
                {record.attendees?.map(att => (
                  <span key={att._id} className="text-ink bg-transparent font-mono font-bold text-[10px] px-2 py-1 border-2 border-ink uppercase tracking-widest" title={`${att.role} - ${att.department}`}>
                    {att.username}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="text-center font-mono text-neutral-500 text-sm py-10 uppercase tracking-widest">No attendance records found.</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRegistry;
