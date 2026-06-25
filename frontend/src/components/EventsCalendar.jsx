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
    <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto font-sans text-ink relative">
      <div className="flex justify-between items-end mb-10 border-b-2 border-ink pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-1">Calendar</h2>
          <p className="text-sm font-mono text-neutral-600">View upcoming club events and scheduled meetings.</p>
        </div>
        
        <div className="flex items-center schematic-card-flat p-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-ink">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-sm font-mono font-bold text-ink min-w-[150px] text-center uppercase tracking-widest">
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} className="p-1.5 hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-ink">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="schematic-card-flat">
        <div className="grid grid-cols-7 border-b-2 border-ink bg-neutral-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-3 text-center text-[10px] uppercase tracking-widest text-ink font-bold font-mono">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[140px]">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div key={idx} className={`border-r-2 border-b-2 border-ink p-2 relative transition-colors ${day ? 'hover:bg-neutral-100' : 'bg-neutral-200/50'}`}>
                {day && (
                  <>
                    <span className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center mb-1 ${isToday ? 'bg-ink text-white' : 'text-ink'}`}>
                      {day}
                    </span>
                    <div className="space-y-1 overflow-y-auto max-h-[90px] pr-1 custom-scrollbar">
                      {dayEvents.map(e => (
                        <div 
                          key={e._id} 
                          onClick={() => setSelectedEvent(e)}
                          className={`text-[10px] px-2 py-1 font-mono font-bold uppercase tracking-wider truncate cursor-pointer transition-colors border-2 ${
                            e.type === 'meeting' 
                              ? 'bg-white text-blueprint border-blueprint hover:bg-blueprint hover:text-white' 
                              : 'bg-white text-ink border-ink hover:bg-ink hover:text-white'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/80 backdrop-blur-sm">
          <div className="schematic-card w-full max-w-md bg-white">
            <div className="flex justify-between items-start p-6 border-b-2 border-ink">
              <div>
                <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-mono font-bold mb-3 border-2 border-ink text-ink bg-transparent`}>
                  {selectedEvent.type}
                </span>
                <h3 className="text-2xl font-bold text-ink">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-neutral-500 hover:text-ink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-4 font-mono font-bold text-sm">
                <div className="flex items-center gap-4 text-ink">
                  <div className="w-10 h-10 border-2 border-ink flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-blueprint" />
                  </div>
                  <span>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4 text-ink">
                  <div className="w-10 h-10 border-2 border-ink flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blueprint" />
                  </div>
                  <span>{new Date(selectedEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-mono font-bold text-neutral-500 mb-2">Details</h4>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap font-sans">{selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="p-4 border-t-2 border-ink bg-neutral-100 flex items-center justify-between text-xs font-mono font-bold text-ink uppercase tracking-widest">
              <span>Organized by <span className="text-blueprint ml-1">{selectedEvent.author?.username}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
