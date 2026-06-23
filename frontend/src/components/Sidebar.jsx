import React from 'react';
import { LogOut, Home, MessageSquare, ClipboardList, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, simulateUser } = useAuth();

  const tabs = [
    { id: 'notices', label: 'Notice Board', icon: Home },
    { id: 'tasks', label: 'Kanban Tasks', icon: ClipboardList },
    { id: 'chat', label: 'Discussions', icon: MessageSquare },
    { id: 'recruits', label: 'Recruitment ATS', icon: Users },
    { id: 'form_builder', label: 'Form Builder', icon: ClipboardList, roles: ['president'] },
    { id: 'feedback', label: 'Feedback Registry', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 h-full bg-[#0a0a0a] border-r border-[#2c2c2e] flex flex-col font-sans">
      
      {/* Simulated Profile Switcher for Testing (Hidden in Prod usually) */}
      <div className="p-6 border-b border-[#2c2c2e]">
        <div className="bg-[#161617] border border-[#2c2c2e] rounded p-3">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">Simulation Switcher</p>
          <select 
            className="w-full bg-[#1c1c1e] text-xs text-neutral-300 border border-[#2c2c2e] rounded outline-none p-1.5 focus:border-neutral-500 transition-colors"
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
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {tabs.filter(t => !t.roles || t.roles.includes(user.role)).map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-[13px] transition-all duration-150 ease-in-out relative ${
                isActive 
                ? 'text-white font-medium' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40 rounded'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white rounded-r-full"></div>
              )}
              <tab.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-neutral-500'}`} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2c2c2e]">
        <button onClick={logout} className="w-full flex items-center px-3 py-2 text-[13px] text-neutral-500 hover:text-white hover:bg-[#161617] rounded transition-all duration-150 ease-in-out">
          <LogOut className="w-4 h-4 mr-3" />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
