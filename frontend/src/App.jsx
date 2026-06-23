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
      <div className="relative bg-[#0a0a0a] min-h-screen text-neutral-200">
        <button onClick={() => setIsApplying(false)} className="absolute top-6 left-6 z-50 text-[11px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors duration-150">
          ← Back to Login
        </button>
        <JoinUs />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative font-sans text-neutral-200 selection:bg-indigo-500/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-bold tracking-widest uppercase text-white text-lg flex flex-col gap-1 items-center">
            TECHNOVATION
            <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Smart Club OS</span>
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Username" required className="w-full bg-[#161617] border border-[#2c2c2e] text-neutral-200 placeholder-neutral-600 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none transition-all" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
          )}
          <input type="email" placeholder="Email Address" required className="w-full bg-[#161617] border border-[#2c2c2e] text-neutral-200 placeholder-neutral-600 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" required className="w-full bg-[#161617] border border-[#2c2c2e] text-neutral-200 placeholder-neutral-600 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none transition-all" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          
          {!isLogin && (
            <div className="flex gap-4">
              <select className="flex-1 bg-[#161617] border border-[#2c2c2e] text-neutral-400 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none transition-all appearance-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="department_lead">Dept Lead</option>
                <option value="president">President</option>
              </select>
              <select className="flex-1 bg-[#161617] border border-[#2c2c2e] text-neutral-400 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none transition-all appearance-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option value="tech">Tech Wing</option>
                <option value="design">Design Wing</option>
                <option value="pr">PR Wing</option>
                <option value="common">Common</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-white text-black px-4 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors duration-150 mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="text-center text-[11px] text-neutral-500 tracking-wide uppercase">
            {isLogin ? "New to the club? " : "Already registered? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-neutral-300 hover:text-white transition-colors duration-150 ml-1">
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </div>
          
          <div className="w-full h-[0.5px] bg-[#2c2c2e]"></div>
          
          <button onClick={() => setIsApplying(true)} className="text-[10px] font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest">
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
    <header className="h-14 border-b border-[#2c2c2e] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-bold tracking-widest uppercase text-white text-sm">TECHNOVATION</span>
          <span className="tracking-widest uppercase text-[10px] text-neutral-500">Smart Club OS</span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center text-[10px] uppercase tracking-widest text-neutral-500 border border-[#2c2c2e] px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 animate-pulse-slow"></span>
        Active Tenure: 2025–2026
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-[#161617] border border-[#2c2c2e] rounded-full px-3 py-1 flex items-center">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mr-2">Role:</span>
          <select disabled className="bg-transparent text-xs text-neutral-300 outline-none appearance-none cursor-default font-medium">
            <option>{user.role}</option>
          </select>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center text-xs font-medium text-neutral-300">
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
      case 'tasks': return <KanbanTracker />;
      case 'chat': return <ChatPanel />;
      case 'recruits': return <AdminATS />;
      case 'form_builder': return <FormBuilder />;
      case 'feedback': return <FeedbackBoard />;
      default: return <NoticeBoard />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-indigo-500/30">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;
