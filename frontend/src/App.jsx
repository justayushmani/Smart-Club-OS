import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import NoticeBoard from './components/NoticeBoard';
import KanbanTracker from './components/KanbanTracker';
import ChatPanel from './components/ChatPanel';
import AdminATS from './components/AdminATS';
import FeedbackBoard from './components/FeedbackBoard';
import FormBuilder from './components/FormBuilder';
import JoinUs from './components/JoinUs';
import EventsRegistry from './components/EventsRegistry';
import EventsCalendar from './components/EventsCalendar';
import AttendanceRegistry from './components/AttendanceRegistry';

const Login = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'member', department: 'tech' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password, formData.role, formData.department);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  if (isApplying) {
    return (
      <div className="relative bg-paper min-h-screen text-ink">
        <button onClick={() => setIsApplying(false)} className="absolute top-6 left-6 z-50 text-[11px] uppercase tracking-widest text-neutral-500 hover:text-blueprint transition-colors duration-150 flex items-center gap-2">
          <span className="bg-white border-2 border-ink px-1.5 py-0.5 rounded-none text-[9px] text-ink font-mono font-bold shadow-[1px_1px_0_0_#111111]">[Esc ⎋]</span> Back to Login
        </button>
        <JoinUs />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative font-sans text-ink selection:bg-blueprint/20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-bold tracking-widest uppercase text-ink text-lg flex flex-col gap-1 items-center">
            TECHNOVATION
            <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Smart Club OS</span>
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Username" required className="w-full schematic-input px-4 py-3 text-sm" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
          )}
          <input type="email" placeholder="Email Address" required className="w-full schematic-input px-4 py-3 text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" required className="w-full schematic-input px-4 py-3 text-sm" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          
          {!isLogin && (
            <div className="flex gap-4 pt-2">
              <select className="flex-1 schematic-input px-4 py-3 text-sm appearance-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="department_lead">Dept Lead</option>
                <option value="president">President</option>
              </select>
              <select className="flex-1 schematic-input px-4 py-3 text-sm appearance-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option value="tech">Tech Wing</option>
                <option value="design">Design Wing</option>
                <option value="pr">PR Wing</option>
                <option value="common">Common</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full schematic-button mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="text-center text-[11px] text-neutral-600 tracking-wide uppercase font-mono">
            {isLogin ? "New to the club? " : "Already registered? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-ink hover:text-blueprint transition-colors duration-150 ml-1 font-bold">
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </div>
          
          <div className="w-full h-[2px] bg-ink/10"></div>
          
          <button onClick={() => setIsApplying(true)} className="text-[10px] font-bold text-neutral-500 hover:text-ink transition-colors uppercase tracking-widest font-mono">
            View Public Application Form
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user }) => {
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <header className="h-14 border-b-2 border-ink bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-[0_2px_0_0_#111111]">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-bold tracking-widest text-ink uppercase text-sm">TECHNOVATION://</span>
          <span className="text-blueprint font-mono text-xs">smart_club_os</span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center text-[10px] uppercase tracking-widest font-mono text-ink">
        <span className="text-neutral-500 mr-2">db_ping: <span className="text-blueprint font-bold">12ms</span></span>
        <span className="text-neutral-500">/ status: <span className="text-blueprint font-bold flex items-center inline-flex gap-1.5"><span className="w-2 h-2 bg-blueprint rounded-none animate-pulse"></span>active</span></span>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-paper border-2 border-ink rounded-none px-3 py-1 flex items-center font-mono shadow-[2px_2px_0_0_#111111]">
          <span className="text-blueprint font-bold mr-2">$</span>
          <span className="text-[10px] text-neutral-600 uppercase tracking-widest mr-1">whoami --role=</span>
          <div className="flex items-center">
            <span className="text-xs text-ink font-bold uppercase">{user.role}</span>
            <span className="text-blueprint ml-1 animate-pulse">▋</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-none bg-paper border-2 border-ink flex items-center justify-center text-xs font-mono font-bold text-blueprint shadow-[2px_2px_0_0_#111111]">
          {getInitials(user.username)}
        </div>
      </div>
    </header>
  );
};

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notices');

  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case 'notices': return <NoticeBoard />;
      case 'events': return <EventsRegistry />;
      case 'calendar': return <EventsCalendar />;
      case 'attendance': return <AttendanceRegistry />;
      case 'tasks': return <KanbanTracker />;
      case 'chat': return <ChatPanel />;
      case 'recruits': return <AdminATS />;
      case 'form_builder': return <FormBuilder />;
      case 'feedback': return <FeedbackBoard />;
      default: return <NoticeBoard />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-paper text-ink font-sans selection:bg-blueprint/20">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-transparent relative z-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;
