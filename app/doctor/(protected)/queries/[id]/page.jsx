// app/doctor/(protected)/queries/[id]/page.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Send, Loader2, User, Shield, Clock, CheckCircle,
  XCircle, AlertCircle, MessageCircle, ChevronDown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function QueryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchQuery();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [query]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchQuery = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctor/queries/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch query');
      }

      if (result.success) {
        setQuery(result.data);
      }
    } catch (error) {
      console.error('Error fetching query:', error);
      toast.error(error.message || 'Failed to load query');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    // ─── FIX: Check if query is closed or resolved before sending ───
    if (query.status === 'closed') {
      toast.error('This query is closed. Please reopen it first.');
      return;
    }

    if (query.status === 'resolved') {
      toast.error('This query is resolved. Please reopen it first.');
      return;
    }

    try {
      setSending(true);
      const response = await fetch(`/api/doctor/queries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      if (result.success) {
        setQuery(result.data);
        setReply('');
        toast.success('Reply sent successfully');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/doctor/queries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      if (result.success) {
        setQuery(result.data);
        toast.success(result.message || `Query ${newStatus}ed successfully`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      open: { icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Open' },
      in_progress: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'In Progress' },
      resolved: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Resolved' },
      closed: { icon: XCircle, color: 'text-gray-500 bg-gray-50 border-gray-200', label: 'Closed' },
    };
    const c = config[status] || config.open;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${c.color}`}>
        <Icon className="w-4 h-4" /> {c.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-50 text-blue-600',
      high: 'bg-amber-50 text-amber-600',
      urgent: 'bg-red-50 text-red-600',
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config[priority] || config.low}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading query...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Query not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isClosed = query.status === 'closed';
  const isResolved = query.status === 'resolved';
  const canReply = !isClosed && !isResolved;

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[900px] mx-auto">
      <Toaster position="top-right" />

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Queries
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{query.subject}</h1>
              {getPriorityBadge(query.priority)}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Category: {query.category.replace('_', ' ')} • {query.age}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {getStatusBadge(query.status)}
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-400">ID: #{query._id.slice(-6)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {query.status === 'open' && (
              <button
                onClick={() => handleStatusUpdate('resolve')}
                disabled={updating}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Resolve
              </button>
            )}
            {(query.status === 'resolved' || query.status === 'open') && (
              <button
                onClick={() => handleStatusUpdate('close')}
                disabled={updating}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Close
              </button>
            )}
            {query.status === 'in_progress' && (
              <button
                onClick={() => handleStatusUpdate('close')}
                disabled={updating}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Close
              </button>
            )}
            {(isClosed || isResolved) && (
              <button
                onClick={() => handleStatusUpdate('reopen')}
                disabled={updating}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" /> Reopen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Conversation</h2>
        </div>
        <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
          {query.conversation && query.conversation.length > 0 ? (
            query.conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.sender === 'doctor'
                      ? 'bg-[#0D1B2A] text-white'
                      : 'bg-gray-50 border border-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === 'doctor' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-xs font-medium opacity-70">
                      {msg.sender === 'doctor' ? 'You' : 'Admin'}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {new Date(msg.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${msg.sender === 'doctor' ? 'text-white/90' : 'text-gray-700'}`}>
                    {msg.message}
                  </p>
                  {msg.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs underline ${
                            msg.sender === 'doctor' ? 'text-blue-300' : 'text-blue-600'
                          }`}
                        >
                          📎 {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-6">No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── Reply Input - Only show if can reply ─── */}
        {canReply ? (
          <div className="p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows="2"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !reply.trim()}
                className="px-6 py-2.5 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 self-end"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        ) : (
          // ─── Show disabled state when closed or resolved ───
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isClosed ? (
                  <XCircle className="w-5 h-5 text-gray-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <span className="text-sm font-medium text-gray-600">
                  {isClosed ? 'This query is closed' : 'This query is resolved'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {isClosed 
                  ? 'Closed queries cannot be replied to. Click "Reopen" to continue the conversation.'
                  : 'Resolved queries cannot be replied to. Click "Reopen" to continue the conversation.'
                }
              </p>
              <button
                onClick={() => handleStatusUpdate('reopen')}
                disabled={updating}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                Reopen Query
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}