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
    <div className="flex h-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex w-full bg-[#161617] border-[0.5px] border-[#2c2c2e] rounded-lg overflow-hidden shadow-2xl">
        <div className="w-56 bg-[#0a0a0a] border-r border-[#2c2c2e] flex flex-col">
          <div className="p-4 border-b border-[#2c2c2e]">
            <h3 className="text-[10px] text-neutral-500 tracking-widest uppercase font-semibold">Channels</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {channels.map(ch => {
              const isActive = activeChannel === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded transition-all duration-150 ease-in-out ${
                    isActive 
                      ? 'bg-[#1c1c1e] text-white font-medium' 
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-[#161617]'
                  }`}
                >
                  <span className="text-neutral-600 mr-1.5">#</span>{ch}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-[#2c2c2e] flex justify-between items-center shrink-0">
            <h3 className="font-medium text-white text-sm flex items-center">
              <span className="text-neutral-600 mr-2">#</span>{activeChannel}
            </h3>
            {activeChannel === 'announcements' && <span className="border border-neutral-800 text-neutral-500 bg-transparent px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm">Read Only</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => {
              const isMe = msg.sender?._id === user._id;
              return (
                <div key={msg._id || idx} className="flex gap-4 group">
                  <div className="w-8 h-8 rounded bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center text-xs text-neutral-400 shrink-0">
                    {msg.sender?.username ? msg.sender.username.substring(0,2).toUpperCase() : '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className={`text-sm font-bold ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                        {msg.sender?.username || 'Unknown User'}
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider bg-[#1c1c1e] border border-[#2c2c2e] px-1.5 py-0.5 rounded-sm">
                        {msg.sender?.role || 'member'}
                      </span>
                      <span className="text-[10px] text-neutral-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-neutral-200 text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="text-center text-neutral-600 text-sm py-10">This channel is quiet.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#2c2c2e] bg-[#0a0a0a]">
            {canPost ? (
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={`Message #${activeChannel}`}
                  className="w-full bg-[#161617] border border-[#2c2c2e] text-neutral-200 text-sm rounded px-4 py-2.5 focus:border-neutral-500 outline-none transition-colors"
                />
                <button type="submit" className="absolute right-2 text-neutral-500 hover:text-white transition-colors p-1">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="bg-[#161617] border border-[#2c2c2e] text-center text-xs text-neutral-500 py-2.5 rounded">
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
