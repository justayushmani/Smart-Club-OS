import React from 'react';
import { LogOut, Home, MessageSquare, ClipboardList, Users, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, simulateUser } = useAuth();

  const tabs = [
    { id: 'notices', label: 'Notice Board', icon: Home },
    { id: 'tasks', label: 'Kanban Tasks', icon: ClipboardList },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'recruits', label: 'Recruitment ATS', icon: Users },
    { id: 'form_builder', label: 'Form Builder', icon: ClipboardList, roles: ['president'] },
    { id: 'feedback', label: 'Grievances', icon: ShieldAlert },
  ];

  return (
    <div className="w-72 h-screen bg-[#0f172a] border-r border-white/10 text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>
      <div className="p-6 relative z-10">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white text-lg leading-none">⚡</span>
          </div>
          Club OS
        </h1>
        
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Profile</p>
            <select 
              className="bg-gray-800 text-xs text-emerald-400 border border-gray-700 rounded outline-none p-1"
              onChange={(e) => {
                simulateUser(e.target.value);
                e.target.value = ""; // Reset to default to allow re-selecting the same option
              }}
              defaultValue=""
            >
              <option value="" disabled>Simulate Profile...</option>
              <option value="president">John (President)</option>
              <option value="lead">Sarah (Tech Lead)</option>
              <option value="member">Alex (Tech Member)</option>
            </select>
          </div>
          <p className="text-base font-bold text-gray-100">{user.username}</p>
          <div className="mt-2 inline-flex items-center text-xs px-2.5 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 font-medium capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            {user.role} • {user.department}
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 relative z-10 overflow-y-auto">
        {tabs.filter(t => !t.roles || t.roles.includes(user.role)).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
              activeTab === tab.id 
              ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]' 
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <tab.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-6 relative z-10 border-t border-white/5">
        <button onClick={logout} className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-xl transition-all border border-red-500/20">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
