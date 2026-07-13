// app/doctor/(protected)/raise-query/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, X, Loader2, AlertCircle, CheckCircle,
  MessageCircle, HelpCircle, Shield, DollarSign, User,
  Star, Zap, ChevronRight, Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const categories = [
  { value: 'technical', label: 'Technical Issue', icon: Zap },
  { value: 'billing', label: 'Billing/Payment', icon: DollarSign },
  { value: 'account', label: 'Account Related', icon: User },
  { value: 'feature_request', label: 'Feature Request', icon: Star },
  { value: 'verification', label: 'Verification', icon: Shield },
  { value: 'patient', label: 'Patient Related', icon: MessageCircle },
  { value: 'general', label: 'General', icon: HelpCircle },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-600' },
  { value: 'high', label: 'High', color: 'bg-amber-50 text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-600' },
];

export default function RaiseQueryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [recentQueries, setRecentQueries] = useState([]);
  const [fetchingQueries, setFetchingQueries] = useState(true);

  useEffect(() => {
    fetchRecentQueries();
  }, []);

  const fetchRecentQueries = async () => {
    try {
      setFetchingQueries(true);
      const response = await fetch('/api/doctor/queries?limit=5');
      const result = await response.json();
      if (result.success) {
        setRecentQueries(result.data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setFetchingQueries(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.subject.trim()) {
      setErrors(prev => ({ ...prev, subject: 'Subject is required' }));
      return;
    }

    if (!formData.message.trim()) {
      setErrors(prev => ({ ...prev, message: 'Message is required' }));
      return;
    }

    if (formData.subject.length > 200) {
      setErrors(prev => ({ ...prev, subject: 'Subject must be less than 200 characters' }));
      return;
    }

    if (formData.message.length > 5000) {
      setErrors(prev => ({ ...prev, message: 'Message must be less than 5000 characters' }));
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/doctor/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit query');
      }

      toast.success('Query submitted successfully!');
      setFormData({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium',
      });
      await fetchRecentQueries();

      // Redirect to query history after 2 seconds
      setTimeout(() => {
        router.push('/doctor/queries');
      }, 2000);
    } catch (error) {
      console.error('Error submitting query:', error);
      toast.error(error.message || 'Failed to submit query');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-amber-50 text-amber-600 border-amber-200',
      in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
      resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      closed: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    return styles[status] || styles.open;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[1200px] mx-auto">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Raise a Query</h1>
        <p className="text-gray-500 mt-1">Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your issue"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{formData.subject.length}/200 characters</p>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your issue in detail..."
                rows="6"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={5000}
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">{errors.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{formData.message.length}/5000 characters</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-2.5 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Query
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/doctor/queries')}
                className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
              >
                View All Queries
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Tips for a better response:</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Be specific and provide relevant details</li>
              <li>• Include any error messages you're seeing</li>
              <li>• Choose the correct category for faster routing</li>
              <li>• Set appropriate priority based on urgency</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Queries */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Queries</h3>
              <button
                onClick={() => router.push('/doctor/queries')}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            {fetchingQueries ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : recentQueries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No queries yet</p>
            ) : (
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div
                    key={query._id}
                    className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/doctor/queries/${query._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{query.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{query.age}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(query.status)}`}>
                        {query.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Queries</span>
                <span className="font-semibold text-gray-900">{recentQueries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Open</span>
                <span className="font-semibold text-amber-600">
                  {recentQueries.filter(q => q.status === 'open').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">In Progress</span>
                <span className="font-semibold text-blue-600">
                  {recentQueries.filter(q => q.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Resolved</span>
                <span className="font-semibold text-emerald-600">
                  {recentQueries.filter(q => q.status === 'resolved').length}
                </span>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2e44] rounded-2xl p-6 text-white">
            <MessageCircle className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="font-semibold text-lg">Need urgent help?</h4>
            <p className="text-sm text-gray-300 mt-1">Contact our support team directly</p>
            <button className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition w-full">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}