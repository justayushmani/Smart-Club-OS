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
      <div className="relative">
        <button onClick={() => setIsApplying(false)} className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition">
          ← Back to Login
        </button>
        <JoinUs />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md animate-fade-in-up relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400 mb-4 tracking-tighter">Smart Club</h1>
          <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">{isLogin ? 'Access your portal' : 'Join the operating system'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input type="text" placeholder="Username" required className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
          )}
          <input type="email" placeholder="Email Address" required className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" required className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          
          {!isLogin && (
            <div className="flex gap-4">
              <select className="flex-1 bg-white/5 border border-white/10 text-gray-300 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [&>option]:text-gray-900 font-medium" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="department_lead">Dept Lead</option>
                <option value="president">President</option>
              </select>
              <select className="flex-1 bg-white/5 border border-white/10 text-gray-300 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [&>option]:text-gray-900 font-medium" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option value="tech">Tech Wing</option>
                <option value="design">Design Wing</option>
                <option value="pr">PR Wing</option>
                <option value="common">Common</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-4 rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] transform hover:-translate-y-1">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-center text-sm text-gray-400 font-medium">
            {isLogin ? "New to the club? " : "Already registered? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors ml-1">
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </div>
          
          <div className="w-full h-px bg-white/10"></div>
          
          <button onClick={() => setIsApplying(true)} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide">
            View Public Application Form
          </button>
        </div>
      </div>
    </div>
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainApp;
