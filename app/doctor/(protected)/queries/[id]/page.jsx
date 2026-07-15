"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Send, Loader2, User, Shield, Clock, CheckCircle,
  XCircle, AlertCircle, MessageCircle, ChevronDown, Image, File,
  Download, Eye, X, Paperclip, Upload, Trash2
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
  const [viewingFile, setViewingFile] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // File upload config
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];

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

  // ─── File Upload ──────────────────────────────────────────
  const handleFileUpload = async (file) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, WEBP, and PDF files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check if already uploaded
    if (replyAttachments.some(a => a.name === file.name && a.size === file.size)) {
      toast.error('This file is already attached');
      return;
    }

    try {
      setUploadingFiles(true);
      const toastId = toast.loading(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'doctor_queries');
      formData.append('folder', 'doctor_queries');

      const response = await fetch('/api/doctor/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success) {
        const uploadedFile = {
          name: result.data.originalName || file.name,
          url: result.data.url,
          size: file.size,
          type: file.type,
          publicId: result.data.publicId,
        };

        setReplyAttachments(prev => [...prev, uploadedFile]);
        toast.success(`${file.name} uploaded successfully`, { id: toastId });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      handleFileUpload(files[i]);
    }

    e.target.value = '';
  };

  const removeReplyAttachment = (index) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    if (!reply.trim() && replyAttachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

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
        body: JSON.stringify({
          message: reply.trim() || 'Attachment(s) attached',
          attachments: replyAttachments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      if (result.success) {
        setQuery(result.data);
        setReply('');
        setReplyAttachments([]);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type) => {
    return type && type.startsWith('image/');
  };

  const getFileIcon = (type) => {
    if (isImage(type)) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const openFileViewer = (file) => {
    setViewingFile(file);
  };

  const closeFileViewer = () => {
    setViewingFile(null);
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

  // ─── File Viewer Modal ───
  const FileViewerModal = () => {
    if (!viewingFile) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeFileViewer}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(viewingFile.type)}
              <div>
                <p className="font-medium text-gray-900">{viewingFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(viewingFile.size)}</p>
              </div>
            </div>
            <button
              onClick={closeFileViewer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center">
            {isImage(viewingFile.type) ? (
              <img
                src={viewingFile.url}
                alt={viewingFile.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : viewingFile.type === 'application/pdf' ? (
              <iframe
                src={`${viewingFile.url}#toolbar=1`}
                className="w-full h-[70vh] rounded-lg"
                title={viewingFile.name}
              />
            ) : (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                <a
                  href={viewingFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] transition"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <a
              href={viewingFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] text-white rounded-lg hover:bg-[#1a2e44] transition"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[900px] mx-auto">
      <Toaster position="top-right" />

      {/* File Viewer Modal */}
      <FileViewerModal />

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
                  
                  {/* Attachments with Image Preview */}
                  {msg.attachments?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((att, i) => {
                        const isImageFile = isImage(att.type);
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                              msg.sender === 'doctor'
                                ? 'bg-white/10 hover:bg-white/20'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => openFileViewer(att)}
                          >
                            {isImageFile ? (
                              <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${
                                msg.sender === 'doctor' ? 'bg-white/20' : 'bg-gray-200'
                              }`}>
                                {getFileIcon(att.type)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${
                                msg.sender === 'doctor' ? 'text-white/90' : 'text-gray-700'
                              }`}>
                                {att.name}
                              </p>
                              <p className={`text-[10px] ${
                                msg.sender === 'doctor' ? 'text-white/50' : 'text-gray-400'
                              }`}>
                                {formatFileSize(att.size)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openFileViewer(att);
                              }}
                              className={`p-1.5 rounded transition ${
                                msg.sender === 'doctor'
                                  ? 'hover:bg-white/20 text-white/70'
                                  : 'hover:bg-gray-300 text-gray-500'
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
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

        {/* ─── Reply Input with File Upload ─── */}
        {canReply ? (
          <div className="p-6 border-t border-gray-100">
            {/* Reply Attachments Preview */}
            {replyAttachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {replyAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {isImage(file.type) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                    <span className="text-xs text-gray-600 truncate max-w-[100px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeReplyAttachment(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

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
              <div className="flex flex-col gap-2">
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-600 disabled:opacity-50"
                  title="Attach files"
                >
                  {uploadingFiles ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Send Button */}
                <button
                  onClick={handleSendReply}
                  disabled={sending || (!reply.trim() && replyAttachments.length === 0)}
                  className="p-2.5 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white rounded-lg transition disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
                {replyAttachments.length > 0 && ` · ${replyAttachments.length} file(s) attached`}
              </p>
              <p className="text-xs text-gray-400">
                Max 5MB · JPG, PNG, GIF, WEBP, PDF
              </p>
            </div>
          </div>
        ) : (
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