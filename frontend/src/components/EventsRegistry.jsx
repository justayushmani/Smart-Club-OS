import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar as CalendarIcon, MapPin } from 'lucide-react';

const EventsRegistry = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', type: 'event' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/events', formData);
      // Insert in sorted order (simplified by refetching or appending)
      setEvents([...events, res.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowForm(false);
      setFormData({ title: '', description: '', date: '', type: 'event' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-10 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Events Registry</h2>
          <p className="text-xs text-neutral-500">Details about various events and meetings that we perform.</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-black px-3 py-1.5 text-xs font-medium rounded hover:bg-neutral-200 transition-colors flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Event
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#161617] p-6 rounded-lg border-[0.5px] border-[#2c2c2e] mb-10">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 mb-4">
            <input type="text" placeholder="Event Title" className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <input type="datetime-local" className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-400 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <select className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-400 px-3 py-2 text-sm focus:border-neutral-500 outline-none rounded-sm transition-colors appearance-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <textarea placeholder="Event Details & Description..." className="bg-[#1c1c1e] border border-[#2c2c2e] text-neutral-200 px-3 py-3 text-sm h-32 w-full mb-4 focus:border-neutral-500 outline-none rounded-sm transition-colors resize-none" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors">Create Event</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-[#161617] p-8 rounded-lg border-[0.5px] border-[#2c2c2e] transition-all duration-150 ease-in-out hover:bg-neutral-800/40 hover:border-neutral-700 relative group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`border ${event.type === 'meeting' ? 'border-indigo-900/50 text-indigo-400 bg-indigo-900/10' : 'border-emerald-900/50 text-emerald-400 bg-emerald-900/10'} px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm`}>
                {event.type}
              </span>
              {(user.role === 'president' || user.role === 'department_lead') && (
                <button onClick={() => handleDelete(event._id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
            
            <div className="flex items-center text-xs text-neutral-400 mb-4 gap-4">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap flex-1">{event.description}</p>
            
            <div className="mt-8 pt-4 border-t border-[#2c2c2e] flex items-center text-[10px] text-neutral-500 uppercase tracking-widest">
              <span>Organized by: <span className="text-neutral-300">{event.author?.username}</span></span>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-2 text-center text-neutral-600 text-sm py-10">No events found.</div>
        )}
      </div>
    </div>
  );
};

export default EventsRegistry;
