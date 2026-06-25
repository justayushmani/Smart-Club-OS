import React from 'react';
import { LogOut, Home, MessageSquare, ClipboardList, Users, ShieldAlert, Calendar, CalendarDays, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, simulateUser } = useAuth();

  const tabs = [
    { id: 'notices', label: 'Notice Board', icon: Home },
    { id: 'events', label: 'Events Registry', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'attendance', label: 'Attendance Registry', icon: CheckSquare },
    { id: 'tasks', label: 'Project Board', icon: ClipboardList },
    { id: 'chat', label: 'Discussions', icon: MessageSquare },
    { id: 'recruits', label: 'Recruitment ATS', icon: Users },
    { id: 'form_builder', label: 'Form Builder', icon: ClipboardList, roles: ['president'] },
    { id: 'feedback', label: 'Feedback Registry', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 h-full bg-paper border-r-2 border-ink flex flex-col font-sans z-10 shadow-[2px_0_0_0_#111111]">
      
      {/* Simulated Profile Switcher for Testing (Hidden in Prod usually) */}
      <div className="p-6 border-b-2 border-ink">
        <div className="schematic-card-flat p-3 shadow-[2px_2px_0_0_#111111]">
          <p className="text-[9px] text-ink uppercase tracking-widest font-bold mb-2">Simulation Switcher</p>
          <select 
            className="w-full schematic-input text-xs text-blueprint pb-1 appearance-none"
            onChange={(e) => {
              simulateUser(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="" disabled>Switch Profile...</option>
            <option value="president">John (President)</option>
            <option value="lead">Sarah (Tech Lead)</option>
            <option value="member">Alex (Tech Member)</option>
          </select>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto font-mono">
        {tabs.filter(t => !t.roles || t.roles.includes(user.role)).map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-[12px] transition-all duration-150 ease-in-out relative group ${
                isActive 
                ? 'text-blueprint font-bold bg-blueprint/10 schematic-card-flat shadow-[2px_2px_0_0_#111111] translate-x-[-2px] translate-y-[-2px]' 
                : 'text-neutral-600 hover:text-ink hover:bg-neutral-200/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blueprint' : 'text-neutral-500 group-hover:text-ink'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="flex-1 text-left">~/{tab.label.toLowerCase().replace(/ /g, '_')}</span>
              <span className={`text-[9px] opacity-0 group-hover:opacity-100 transition-opacity font-bold ${isActive ? 'text-blueprint/80' : 'text-neutral-400'}`}>[⌘{idx+1}]</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-ink font-mono">
        <button onClick={logout} className="w-full flex items-center px-3 py-2 text-[12px] text-ink font-bold hover:text-white hover:bg-red-500 schematic-card-flat shadow-[2px_2px_0_0_#111111] transition-all duration-150 ease-in-out group">
          <LogOut className="w-4 h-4 mr-3 group-hover:text-white" />
          ~/disconnect
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
