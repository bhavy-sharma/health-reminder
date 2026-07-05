"use client";

import { useState } from "react";
import { Bell, Search, Star, Flag, ThumbsUp, Send } from "lucide-react";

export default function DoctorReviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      patient: "Ramesh S.",
      initials: "RS",
      color: "bg-[#4a9e7f]",
      date: "2 days ago",
      rating: 5,
      text: "Excellent doctor. Explained everything clearly about my heart condition. Very patient and thorough. Highly recommend!",
      helpful: 24,
      helpfulClicked: false,
      replied: false,
      flagged: false
    },
    {
      id: 2,
      patient: "Nalini B.",
      initials: "NB",
      color: "bg-[#e9a84c]",
      date: "2 months ago",
      rating: 5,
      text: "Dr. Mehta is exceptional! She took time to explain my echocardiogram results in simple terms and answered all questions.",
      helpful: 42,
      helpfulClicked: false,
      replied: true,
      replyText: "Thank you Nalini! Please don't hesitate to reach out with any questions.",
      flagged: true
    },
    {
      id: 3,
      patient: "rakk",
      initials: "R",
      color: "bg-[#0d1b2a]",
      date: "Just now",
      rating: 5,
      text: "yffihi",
      helpful: 0,
      helpfulClicked: false,
      replied: false,
      flagged: false
    }
  ]);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const ratingBreakdown = [
    { stars: 5, percent: 78 },
    { stars: 4, percent: 14 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 1 }
  ];

  const toggleFlag = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, flagged: !r.flagged } : r));
  };

  const toggleHelpful = (id) => {
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
    setReviews(reviews.map(r => r.id === id ? { ...r, replied: true, replyText: replyText } : r));
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="p-8 pb-20 h-screen overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-[var(--color-navy)] font-bold">Reviews</span>
        </div>
        <button className="relative p-2 text-[var(--color-navy)] hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-pulse-red)] rounded-full border-2 border-[var(--color-cream)]"></span>
        </button>
      </div>

      {/* Page Title & Rating Badge */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-1">Reviews</h1>
          <p className="text-[var(--color-text-muted)]">6 total · <span className="text-[var(--color-warm-amber)] font-medium">3 need a reply</span></p>
        </div>
        <div className="bg-[var(--color-warning-fill)] border border-[var(--color-warm-amber)]/20 text-[var(--color-warm-amber)] px-4 py-2 rounded-[var(--radius-card-sm)] flex items-center gap-2 font-fraunces text-xl font-bold shadow-sm">
          <Star size={20} fill="currentColor" /> 4.5
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-10">
          {/* Main Score */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <h2 className="font-fraunces text-7xl font-bold text-[var(--color-navy)] mb-2 tracking-tight">4.5</h2>
            <div className="flex text-[var(--color-warm-amber)] mb-2">
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" />
              <Star size={24} fill="currentColor" className="opacity-50" />
            </div>
            <p className="text-[var(--color-text-muted)] text-sm font-medium">312 lifetime reviews</p>
          </div>

          {/* Breakdown Bars */}
          <div className="flex-1 w-full space-y-2.5">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--color-text-secondary)] w-3 text-right">{item.stars}</span>
                <Star size={12} fill="currentColor" className="text-[var(--color-warm-amber)] shrink-0" />
                <div className="flex-1 h-2.5 bg-[#efebe4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-warm-amber)] rounded-full" 
                    style={{ width: `${item.percent}%`, opacity: item.stars < 4 ? 0.5 : 1 }}
                  ></div>
                </div>
                <span className="text-xs text-[var(--color-text-muted)] w-8 text-right font-medium">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[var(--color-border)] text-center divide-x divide-[var(--color-border)]">
          <div>
            <div className="font-fraunces text-2xl font-bold text-[var(--color-sage-green)] mb-1">78%</div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Response Rate</p>
          </div>
          <div>
            <div className="font-fraunces text-2xl font-bold text-[var(--color-navy)] mb-1">&lt; 4h</div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Avg Response Time</p>
          </div>
          <div>
            <div className="font-fraunces text-2xl font-bold text-[var(--color-warm-amber)] mb-1">96%</div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Recommend Rate</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
        <input 
          type="text" 
          placeholder="Search reviews..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-sm"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className={`bg-white rounded-[var(--radius-card-lg)] p-6 transition-all ${
              review.flagged 
                ? 'border-2 border-[#fca5a5]' 
                : 'border border-[var(--color-border)] shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${review.color} text-white flex items-center justify-center font-bold text-lg`}>
                  {review.initials}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)] text-lg">{review.patient}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex text-[var(--color-warm-amber)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-[var(--color-border)]" : ""} />
                  ))}
                </div>
                <button 
                  onClick={() => toggleFlag(review.id)}
                  className={`transition-colors ${review.flagged ? 'text-[#e8403a]' : 'text-gray-300 hover:text-[#e8403a]'}`}
                >
                  <Flag size={16} fill={review.flagged ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4 text-sm">
              {review.text}
            </p>

            {/* Replied State */}
            {review.replied && (
              <div className="mt-4 p-4 rounded-xl bg-[#efebe4]/50 border-l-4 border-[#4a9e7f] mb-4">
                <h5 className="text-sm font-bold text-[#4a9e7f] mb-1">Your Reply</h5>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {review.replyText}
                </p>
              </div>
            )}

            {/* Replying State (Input area) */}
            {replyingTo === review.id && !review.replied && (
              <div className="mt-4 mb-4">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-[#efebe4]/50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#4a9e7f] text-sm resize-none h-24 text-[var(--color-navy)]" 
                  placeholder="Write a professional reply..."
                  autoFocus
                />
                <div className="flex gap-3 mt-3">
                  <button 
                    onClick={cancelReply}
                    className="flex-1 bg-[#efebe4] text-[var(--color-text-secondary)] font-bold py-3 rounded-xl text-sm hover:bg-[#e2ddd5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => submitReply(review.id)}
                    className={`flex-[2] text-white font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 transition-colors ${
                      replyText.trim() ? 'bg-[var(--color-navy)] hover:bg-[var(--color-navy)]/90' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!replyText.trim()}
                  >
                    <Send size={16} /> Post Reply
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
                    ? 'bg-[#e6f4ef] text-[#4a9e7f]' 
                    : 'bg-[#efebe4] text-[var(--color-text-muted)] hover:bg-[#e6f4ef] hover:text-[#4a9e7f]'
                }`}
              >
                <ThumbsUp size={16} /> Helpful ({review.helpful})
              </button>
              
              {!review.replied && replyingTo !== review.id && (
                <button 
                  onClick={() => startReply(review.id)}
                  className="flex items-center gap-1 text-sm text-[#4a9e7f] font-bold px-2 py-1.5 rounded-full hover:bg-[#e6f4ef] transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
