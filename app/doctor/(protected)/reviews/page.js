// app/doctor/(protected)/reviews/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Star, Flag, ThumbsUp, Send, Loader2, AlertCircle, Clock } from "lucide-react";

export default function DoctorReviews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    flagged: 0,
    needReply: 0,
    responseRate: 0,
    ratingBreakdown: []
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        search: searchQuery,
      });

      const response = await fetch(`/api/doctor/reviews?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      if (result.success) {
        setReviews(result.data.reviews || []);
        setStats(result.data.stats || { total: 0, avgRating: 0, flagged: 0, needReply: 0, responseRate: 0, ratingBreakdown: [] });
      } else {
        throw new Error(result.error || 'Failed to load reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refetch on search
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fetchReviews();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleAction = async (reviewId, action, replyText = '') => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action, replyText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update review');
      }

      if (result.success) {
        await fetchReviews();
        setReplyingTo(null);
        setReplyText('');
      } else {
        throw new Error(result.error || 'Failed to update review');
      }
    } catch (err) {
      console.error('Error updating review:', err);
      alert(`Failed to update: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const toggleFlag = (id, currentFlag) => {
    handleAction(id, currentFlag ? 'unflag' : 'flag');
  };

  const toggleHelpful = (id) => {
    // This would require a separate API endpoint to track helpful clicks
    // For now, we'll just update locally
    setReviews(reviews.map(r => {
      if (r.id === id) {
        if (r.helpfulClicked) {
          return { ...r, helpful: r.helpful - 1, helpfulClicked: false };
        } else {
          return { ...r, helpful: r.helpful + 1, helpfulClicked: true };
        }
      }
      return r;
    }));
  };

  const startReply = (id) => {
    setReplyingTo(id);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const submitReply = (id) => {
    if (!replyText.trim()) return;
    handleAction(id, 'reply', replyText);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.includes('pending') || error.includes('verification')) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Profile is Under Verification</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Patient reviews will become available after your account has been approved.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Reviews</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchReviews}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">Reviews</span>
        </div>
      </div>

      {/* Page Title & Rating Badge */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-1">Reviews</h1>
          <p className="text-gray-500">{stats.total} total · <span className="text-amber-500 font-medium">{stats.needReply} need a reply</span></p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-600 px-4 py-2 rounded-xl flex items-center gap-2 font-serif text-xl font-bold shadow-sm">
          <Star size={20} fill="currentColor" /> {stats.avgRating || 0}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-10">
          {/* Main Score */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <h2 className="font-serif text-7xl font-bold text-gray-900 mb-2 tracking-tight">{stats.avgRating || 0}</h2>
            <div className="flex text-amber-400 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={24} fill={i <= Math.round(stats.avgRating || 0) ? "currentColor" : "none"} className={i > Math.round(stats.avgRating || 0) ? "text-gray-200" : ""} />
              ))}
            </div>
            <p className="text-gray-400 text-sm font-medium">{stats.total} lifetime reviews</p>
          </div>

          {/* Breakdown Bars */}
          <div className="flex-1 w-full space-y-2.5">
            {stats.ratingBreakdown && stats.ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600 w-3 text-right">{item.stars}</span>
                <Star size={12} fill="currentColor" className="text-amber-400 shrink-0" />
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${item.percent || 0}%`, opacity: item.stars < 4 ? 0.5 : 1 }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 w-8 text-right font-medium">{item.percent || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 text-center divide-x divide-gray-200">
          <div>
            <div className="font-serif text-2xl font-bold text-emerald-600 mb-1">{stats.responseRate || 0}%</div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Response Rate</p>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-gray-900 mb-1">&lt; 4h</div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Response Time</p>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-amber-500 mb-1">96%</div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recommend Rate</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reviews..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Star size={32} />
            </div>
            <p className="text-gray-600 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm">Patient reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className={`bg-white rounded-xl p-6 transition-all ${
                review.flagged 
                  ? 'border-2 border-red-300' 
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${review.color || 'bg-gray-400'} text-white flex items-center justify-center font-bold text-lg`}>
                    {review.initials || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{review.patient}</h4>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill={i <= review.rating ? "currentColor" : "none"} className={i > review.rating ? "text-gray-200" : ""} />
                    ))}
                  </div>
                  <button 
                    onClick={() => toggleFlag(review.id, review.flagged)}
                    disabled={updating}
                    className={`transition-colors ${review.flagged ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
                  >
                    <Flag size={16} fill={review.flagged ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                {review.text}
              </p>

              {/* Replied State */}
              {review.replied && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border-l-4 border-emerald-500 mb-4">
                  <h5 className="text-sm font-bold text-emerald-600 mb-1">Your Reply</h5>
                  <p className="text-sm text-gray-600">
                    {review.replyText}
                  </p>
                </div>
              )}

              {/* Replying State */}
              {replyingTo === review.id && !review.replied && (
                <div className="mt-4 mb-4">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none h-24 text-gray-900" 
                    placeholder="Write a professional reply..."
                    autoFocus
                  />
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={cancelReply}
                      className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => submitReply(review.id)}
                      disabled={!replyText.trim() || updating}
                      className={`flex-[2] text-white font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 transition-colors ${
                        replyText.trim() && !updating ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />} 
                      Post Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleHelpful(review.id)}
                  className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full transition-colors ${
                    review.helpfulClicked 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <ThumbsUp size={16} /> Helpful ({review.helpful})
                </button>
                
                {!review.replied && replyingTo !== review.id && (
                  <button 
                    onClick={() => startReply(review.id)}
                    className="flex items-center gap-1 text-sm text-emerald-600 font-bold px-2 py-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}