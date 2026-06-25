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
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto font-sans text-ink">
      <div className="flex justify-between items-end mb-10 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Events Registry</h2>
          <p className="text-sm font-mono text-neutral-600">Details about various events and meetings that we perform.</p>
        </div>
        {(user.role === 'president' || user.role === 'department_lead') && (
          <button onClick={() => setShowForm(!showForm)} className="schematic-button flex items-center text-xs">
            <Plus className="w-4 h-4 mr-2" /> New Event
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="schematic-card p-6 mb-10">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-6 mb-6">
            <input 
              type="text" 
              placeholder="Event Title" 
              className="schematic-input text-lg" 
              required 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
            <input 
              type="datetime-local" 
              className="schematic-input text-sm" 
              required 
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })} 
            />
            <select 
              className="schematic-input text-sm appearance-none" 
              value={formData.type} 
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <textarea 
            placeholder="Event Details & Description..." 
            className="schematic-input w-full h-32 resize-none text-sm mb-6" 
            required 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
          />
          <div className="flex justify-end gap-4 font-mono">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-ink transition-colors font-bold">Cancel</button>
            <button type="submit" className="schematic-button text-xs">Create Event</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event._id} className="schematic-card-flat p-8 transition-all duration-150 ease-in-out hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#111111] group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`border-2 border-ink text-ink bg-transparent px-2 py-1 text-[10px] font-mono uppercase tracking-widest font-bold`}>
                {event.type}
              </span>
              {(user.role === 'president' || user.role === 'department_lead') && (
                <button onClick={() => handleDelete(event._id)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-ink mb-2">{event.title}</h3>
            
            <div className="flex items-center text-xs font-mono font-bold text-blueprint mb-4 gap-4 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>

            <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap flex-1 font-sans">{event.description}</p>
            
            <div className="mt-8 pt-4 border-t-2 border-ink flex items-center text-[10px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
              <span>Organized by: <span className="text-blueprint ml-1">{event.author?.username}</span></span>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-2 text-center font-mono text-neutral-500 text-sm py-10 uppercase tracking-widest">No events found.</div>
        )}
      </div>
    </div>
  );
};

export default EventsRegistry;
