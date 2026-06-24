import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const EventsCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto font-sans relative">
      <div className="flex justify-between items-end mb-10 border-b border-[#2c2c2e] pb-6">
        <div>
          <h2 className="text-xl font-medium text-white mb-1">Calendar</h2>
          <p className="text-xs text-neutral-500">View upcoming club events and scheduled meetings.</p>
        </div>
        
        <div className="flex items-center bg-[#161617] border border-[#2c2c2e] rounded p-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 text-sm font-medium text-neutral-200 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-1.5 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#161617] border border-[#2c2c2e] rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#2c2c2e] bg-[#0a0a0a]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-3 text-center text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div key={idx} className={`border-r border-b border-[#2c2c2e] p-2 relative transition-colors ${day ? 'hover:bg-neutral-800/20' : 'bg-[#0a0a0a]/50'}`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-500 text-white' : 'text-neutral-400'}`}>
                      {day}
                    </span>
                    <div className="space-y-1 overflow-y-auto max-h-[70px] pr-1 custom-scrollbar">
                      {dayEvents.map(e => (
                        <div 
                          key={e._id} 
                          onClick={() => setSelectedEvent(e)}
                          className={`text-[10px] px-1.5 py-1 rounded truncate cursor-pointer transition-colors ${
                            e.type === 'meeting' 
                              ? 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/40 border border-indigo-900/30' 
                              : 'bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-900/30'
                          }`}
                        >
                          {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161617] border border-[#2c2c2e] w-full max-w-md rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-6 border-b border-[#2c2c2e]">
              <div>
                <span className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm mb-3 border ${selectedEvent.type === 'meeting' ? 'border-indigo-900/50 text-indigo-400 bg-indigo-900/10' : 'border-emerald-900/50 text-emerald-400 bg-emerald-900/10'}`}>
                  {selectedEvent.type}
                </span>
                <h3 className="text-xl font-semibold text-white">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-8 h-8 rounded bg-neutral-800/50 flex items-center justify-center text-neutral-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <span>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-8 h-8 rounded bg-neutral-800/50 flex items-center justify-center text-neutral-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>{new Date(selectedEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Details</h4>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#2c2c2e] bg-[#0a0a0a] flex items-center justify-between text-xs text-neutral-500">
              <span>Organized by {selectedEvent.author?.username}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
