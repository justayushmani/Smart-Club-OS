import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

const ChatPanel = () => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const channels = ['general', 'announcements', 'tech-wing', 'design-wing', 'pr-wing'];

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

  const canPost = activeChannel !== 'announcements' || user.role === 'president';

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-8">
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <h3 className="font-bold text-gray-700">Channels</h3>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {channels.map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-200 transition-colors ${activeChannel === ch ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'}`}
            >
              # {ch}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">#{activeChannel}</h3>
            {activeChannel === 'announcements' && <p className="text-xs text-red-500 font-medium">Read-only for members</p>}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user._id;
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-2 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {!isMe && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-xs text-blue-600">{msg.sender?.username}</span>
                      <span className="text-[10px] text-gray-400">{msg.sender?.role}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          {canPost ? (
            <form onSubmit={handleSend} className="flex gap-2 relative">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Message #${activeChannel}`}
                className="flex-1 border border-gray-300 rounded-full pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center text-sm text-gray-500 py-2 italic bg-gray-100 rounded-lg">
              You do not have permission to post in this channel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
