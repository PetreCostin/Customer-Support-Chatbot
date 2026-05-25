'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Plus, LogOut, User, HelpCircle, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const user = getUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', email: user?.email || '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/message', {
        message: userMsg.content,
        sessionId,
      });
      setSessionId(data.sessionId);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          role: 'ASSISTANT',
          content: data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
      setInput(userMsg.content);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tickets', ticketForm);
      toast.success("Support ticket created! We'll be in touch soon.");
      setShowTicketForm(false);
      setTicketForm({ subject: '', description: '', email: user?.email || '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CS</span>
            </div>
            <span className="font-semibold">Support Chat</span>
          </div>
          <button onClick={startNewChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/faqs" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300">
            <HelpCircle className="w-4 h-4" />
            Browse FAQs
          </Link>
          <button onClick={() => setShowTicketForm(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300">
            <Ticket className="w-4 h-4" />
            Create Ticket
          </button>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300">
              <User className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 truncate max-w-[100px]">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary w-full text-center text-sm py-1.5">
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="font-semibold text-gray-900">AI Customer Support</h1>
          <p className="text-sm text-gray-500">Ask me anything — I&apos;m here to help</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">How can I help you today?</h2>
              <p className="text-gray-500 max-w-md">Ask me about your account, orders, billing, or anything else. I can also create a support ticket if needed.</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {['How do I reset my password?', 'Track my order', 'Return policy', 'Billing questions'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={clsx('flex', msg.role === 'USER' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'ASSISTANT' && (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'USER'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              className="flex-1 input-field"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn-primary px-4 py-2" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by AI •{' '}
            <button onClick={() => setShowTicketForm(true)} className="hover:underline">
              Need human support?
            </button>
          </p>
        </div>
      </div>

      {showTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create Support Ticket</h2>
            <form onSubmit={submitTicket} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" value={ticketForm.email} onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" className="input-field" placeholder="Brief description of your issue" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field resize-none" rows={4} placeholder="Please describe your issue in detail..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowTicketForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
