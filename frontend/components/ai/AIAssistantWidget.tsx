'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, ArrowRight, ShieldCheck } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggested_actions?: any[];
  time: string;
}

export default function AIAssistantWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hi there! 👋 I am the UrbanServe AI Assistant. How can I help you today? Ask me to find verified local pros, check your booking status, or launch an emergency service.',
      suggested_actions: [
        { label: 'Find a Plumber', query: 'My sink is leaking water' },
        { label: 'Check Booking Status', query: 'Where is my booking?' },
        { label: 'Emergency Service', query: 'I need urgent quick service' },
      ],
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: textToSend,
        conversation_id: conversationId,
      });

      const data = res.data.data;
      if (data.conversation_id) setConversationId(data.conversation_id);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.message,
        suggested_actions: data.suggested_actions || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I apologize, I am temporarily having trouble contacting our service catalog. Please check your internet connection or browse our services directly!',
          suggested_actions: [{ label: 'View Services', url: '/services' }],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.query) {
      handleSend(action.query);
    } else if (action.url) {
      router.push(action.url);
      setIsOpen(false);
    } else if (action.service_id) {
      router.push(`/services/${action.service_id}`);
      setIsOpen(false);
    } else if (action.action === 'ESCALATE') {
      router.push('/bookings');
      setIsOpen(false);
    } else if (action.action === 'QUICK_SERVICE') {
      router.push('/services?type=QUICK');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-toggle-btn"
          className="group relative flex items-center gap-2.5 px-5 py-3.5 btn-primary rounded-full shadow-emerald transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot size={22} className="animate-bounce-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">Ask AI Assistant</span>
          <span className="hidden group-hover:inline-block text-xs font-medium opacity-90 pl-1 border-l border-white/30 ml-1">
            24/7 Smart Radar
          </span>
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className="w-[92vw] sm:w-[420px] h-[590px] max-h-[85vh] bg-white rounded-3xl shadow-strong border border-stone-200 flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white flex items-center justify-between shadow-sm border-b border-emerald-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30 shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  UrbanServe Assistant
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">Online</span>
                </h3>
                <p className="text-[11px] text-stone-300">Trained on 30+ services & live bookings</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              id="ai-chat-close-btn"
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 gradient-soothing-bg">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[84%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'btn-primary text-white rounded-tr-none'
                      : 'bg-white text-stone-900 shadow-soft border border-stone-200/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  {/* Action Buttons */}
                  {m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="text-[11px] px-3 py-1.5 btn-secondary text-stone-800 font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {act.label}
                          <ArrowRight size={11} className="text-emerald-700" />
                        </button>
                      ))}
                    </div>
                  )}
                  <span className={`block text-[10px] mt-1 text-right ${m.sender === 'user' ? 'text-white/80' : 'text-stone-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot size={16} />
                </div>
                <div className="bg-white rounded-2xl p-3.5 shadow-soft border border-stone-200 flex items-center gap-2 text-xs text-stone-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Thinking and querying catalog...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-chat-input"
              placeholder="Ask about plumbing, cleaning, or your booking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-stone-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 outline-none border border-stone-200 focus:border-emerald-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              id="ai-chat-send-btn"
              disabled={loading || !input.trim()}
              className="p-3 btn-primary disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
