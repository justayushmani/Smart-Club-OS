import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

const ChatPanel = () => {
  const { user } = useAuth();
  
  const allChannels = ['general', 'announcements', 'tech-wing', 'design-wing', 'pr-wing'];
  const channels = user.role === 'president' || user.role === 'department_lead'
    ? allChannels
    : allChannels.filter(ch => ch === `${user.department}-wing` || ch === 'announcements');

  const [activeChannel, setActiveChannel] = useState(channels[0] || 'general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${activeChannel}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await api.post(`/chat/${activeChannel}`, { text });
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending message');
    }
  };

  const canPost = user.role === 'president' || user.role === 'department_lead' || (user.role === 'member' && activeChannel === `${user.department}-wing`);

  return (
    <div className="flex h-full max-w-6xl mx-auto py-8 px-4 font-sans text-ink">
      <div className="flex w-full schematic-card overflow-hidden bg-white">
        <div className="w-64 bg-paper border-r-2 border-ink flex flex-col">
          <div className="p-6 border-b-2 border-ink">
            <h3 className="text-[10px] text-ink tracking-widest uppercase font-mono font-bold">Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
            {channels.map(ch => {
              const isActive = activeChannel === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`w-full text-left px-4 py-3 text-sm font-mono transition-all duration-150 ease-in-out border-2 border-transparent ${
                    isActive 
                      ? 'bg-blueprint/10 text-blueprint font-bold border-blueprint shadow-[2px_2px_0_0_#111111]' 
                      : 'text-neutral-600 hover:text-ink hover:border-drafting hover:bg-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-blueprint' : 'text-neutral-400'} mr-2`}>#</span>{ch}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-white relative">
          <div className="px-8 py-6 border-b-2 border-ink flex justify-between items-center shrink-0">
            <h3 className="font-bold text-ink text-xl flex items-center font-mono">
              <span className="text-neutral-400 mr-2">#</span>{activeChannel}
            </h3>
            {activeChannel === 'announcements' && <span className="border-2 border-ink text-ink px-3 py-1 text-[10px] uppercase tracking-widest font-mono font-bold bg-paper shadow-[2px_2px_0_0_#111111]">Read Only</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isMe = msg.sender?._id === user._id;
              return (
                <div key={msg._id || idx} className={`flex gap-6 group ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-paper border-2 border-ink flex items-center justify-center text-sm font-bold text-ink shrink-0 shadow-[2px_2px_0_0_#111111]">
                    {msg.sender?.username ? msg.sender.username.substring(0,2).toUpperCase() : '??'}
                  </div>
                  <div className={`flex flex-col min-w-0 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-baseline gap-3 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-sm font-bold font-mono ${isMe ? 'text-blueprint' : 'text-ink'}`}>
                        {msg.sender?.username || 'Unknown User'}
                      </span>
                      <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest font-mono bg-paper border-2 border-ink px-2 py-0.5 shadow-[1px_1px_0_0_#111111]">
                        {msg.sender?.role || 'member'}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`schematic-card-flat px-4 py-3 max-w-xl ${isMe ? 'bg-blueprint/5 border-blueprint' : 'bg-paper'}`}>
                      <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="text-center text-neutral-500 font-mono text-sm py-10 uppercase tracking-widest font-bold">This channel is quiet.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t-2 border-ink bg-paper">
            {canPost ? (
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={`Message #${activeChannel}`}
                  className="schematic-input w-full bg-white pr-12 text-sm"
                />
                <button type="submit" className="absolute right-3 text-ink hover:text-blueprint transition-colors p-2 font-bold bg-paper border-2 border-ink shadow-[2px_2px_0_0_#111111] hover:shadow-[0px_0px_0_0_#111111] hover:translate-y-[2px] hover:translate-x-[2px]">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="bg-neutral-100 border-2 border-drafting text-center text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 py-4">
                You do not have permission to post in this channel.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
