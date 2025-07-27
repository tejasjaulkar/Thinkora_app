import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaUserCircle, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa';

const AiAssistantModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I am Think AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    const userMessage = input;
    setInput('');
    setIsGenerating(true);
    setMessages(msgs => [...msgs, { from: 'ai', text: 'generating...', temp: true }]);
    try {
      const res = await axios.post('http://localhost:5001/api/v1/ai/chat', { message: userMessage });
      setMessages(msgs => {
        const msgsWithoutTemp = msgs.filter(m => !m.temp);
        return [...msgsWithoutTemp, { from: 'ai', text: res.data.ai }];
      });
    } catch (err) {
      setMessages(msgs => {
        const msgsWithoutTemp = msgs.filter(m => !m.temp);
        return [...msgsWithoutTemp, { from: 'ai', text: 'Sorry, there was an error.' }];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Always dark mode classes
  const sidebarBg = "bg-[#18181b]";
  const headerBg = "bg-[#23232a]";
  const chatBg = "bg-[#23232a]";
  const aiBubble = "bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] text-white";
  const userBubble = "bg-blue-600 text-white";
  const inputBg = "bg-[#23232a] border-gray-700 text-white placeholder-gray-300";
  const borderColor = "border-gray-700";
  const headerText = "text-white";
  const iconColor = "text-white";
  const closeBtnColor = "text-gray-300 hover:text-red-400";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
        aria-label="Close Think AI"
      />
      {/* Right Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-50 ${sidebarBg} shadow-2xl flex flex-col transition-all duration-300
        ${expanded ? 'w-full sm:w-[700px] max-w-full' : 'w-full sm:w-[420px] max-w-full'}
        animate-slide-in`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg} sticky top-0 z-10`}>
          <div className="flex items-center gap-2">
            <span className="relative flex items-center">
              <FaRobot className={`text-2xl ${iconColor}`} />
            </span>
            <span className={`font-bold text-xl ${headerText}`}>Think AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xl p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <FaCompressArrowsAlt className="text-white" /> : <FaExpandArrowsAlt className="text-white" />}
            </button>
            <button
              onClick={onClose}
              className={`text-2xl font-bold transition ${closeBtnColor}`}
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>
        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${chatBg}`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.from === 'ai' && (
                <div className="flex items-end gap-2">
                  <FaRobot className={`text-xl mb-1 ${iconColor}`} />
                  <div className={`px-4 py-2 rounded-2xl rounded-bl-none shadow max-w-[75%] ${aiBubble}`}>
                    {msg.text}
                  </div>
                </div>
              )}
              {msg.from === 'user' && (
                <div className="flex items-end gap-2 flex-row-reverse">
                  <FaUserCircle className="text-2xl mb-1 text-gray-200" />
                  <div className={`px-4 py-2 rounded-2xl rounded-br-none shadow max-w-[75%] ${userBubble}`}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className={`flex gap-2 px-4 py-4 border-t ${headerBg} sticky bottom-0 z-10 ${borderColor}`}
        >
          <input
            className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${inputBg} ${borderColor}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isGenerating ? "Wait for response..." : "Type your message..."}
            autoFocus
            disabled={isGenerating}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold transition"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Send'}
          </button>
        </form>
      </div>
      {/* Animation (Tailwind) */}
      <style>
        {`
          @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>
    </>
  );
};

export default AiAssistantModal; 