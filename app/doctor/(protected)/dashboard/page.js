// app/doctor/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, CheckCircle2, Zap, Calendar, Star, Eye, IndianRupee, 
  ChevronRight, Check, User, Loader2, AlertCircle, Shield, XCircle, Clock
} from "lucide-react";

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planStatus, setPlanStatus] = useState({
    plan: 'free',
    used: 0,
    limit: 10,
    remaining: 10,
    isUnlimited: false,
    hasReachedLimit: false,
    percentageUsed: 0
  });
  const [data, setData] = useState({
    doctor: {},
    stats: {},
    appointments: [],
    recentActivity: [],
    recentReviews: []
  });

  useEffect(() => {
    fetchDashboardData();
    fetchPlanStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/dashboard');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanStatus = async () => {
    try {
      const response = await fetch('/api/doctor/plans/status');
      const result = await response.json();
      if (result.success) {
        setPlanStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching plan status:', error);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-500';
      case 'pending': return 'text-amber-500';
      case 'completed': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
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
              Your doctor profile has been submitted successfully and is currently being reviewed by our admin team. You will be able to access the dashboard after your account is approved.
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { doctor, stats, appointments, recentActivity, recentReviews } = data;

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-gray-900">Dashboard</span>
        </div>
        <button className="relative p-2 text-gray-700 hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Greeting Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3 flex-wrap">
            {getTimeGreeting()}, Dr. {doctor?.name?.split(' ')[1] || doctor?.name || 'Doctor'} 
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} · {doctor?.city || 'Your City'}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          {doctor?.isVerified && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
              <CheckCircle2 size={16} />
              Verified
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-gray-200">
            <Shield size={14} />
            {planStatus.plan.charAt(0).toUpperCase() + planStatus.plan.slice(1)} Plan
          </div>
        </div>
      </div>

      {/* Plan Limit Warning */}
      {planStatus.hasReachedLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Booking limit reached</p>
              <p className="text-sm text-amber-700">
                You've used {planStatus.used} of {planStatus.limit} bookings this month. 
                Upgrade to continue accepting patients.
              </p>
            </div>
          </div>
          <Link 
            href="/doctor/plans" 
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 w-full sm:w-auto text-center"
          >
            Upgrade Now →
          </Link>
        </div>
      )}

      {/* Plan Usage Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {planStatus.plan.charAt(0).toUpperCase() + planStatus.plan.slice(1)} Plan Usage
                </p>
                <p className="text-xs text-gray-400">
                  {planStatus.isUnlimited ? 'Unlimited bookings' : `${planStatus.used} of ${planStatus.limit} bookings used this month`}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {planStatus.isUnlimited ? '∞' : `${Math.round(planStatus.percentageUsed)}%`}
              </span>
            </div>
            {!planStatus.isUnlimited && (
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    planStatus.hasReachedLimit ? 'bg-red-500' : 
                    planStatus.percentageUsed > 80 ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(planStatus.percentageUsed, 100)}%` }}
                />
              </div>
            )}
          </div>
          {!planStatus.isUnlimited && planStatus.plan !== 'premium' && (
            <Link 
              href="/doctor/plans"
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 w-full sm:w-auto text-center"
            >
              {planStatus.hasReachedLimit ? 'Upgrade to Continue' : 'Upgrade Plan'}
            </Link>
          )}
          {planStatus.isUnlimited && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-200 w-full sm:w-auto text-center">
              Unlimited ✓
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/doctor/appointments" className="block bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <Calendar size={20} />
            </div>
            {stats?.todayPatients > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m18 15-6-6-6 6"/></svg>
                +{stats.todayPatients}
              </span>
            )}
          </div>
          <div className="font-serif text-3xl font-bold text-gray-900 mb-1">{stats?.todayPatients || 0}</div>
          <p className="text-gray-600 font-medium text-sm mb-1">Today's Patients</p>
          <p className="text-gray-400 text-xs">
            {stats?.confirmedToday || 0} confirmed · {stats?.pendingToday || 0} pending
          </p>
        </Link>

        <Link href="/doctor/reviews" className="block bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Star size={20} />
            </div>
            {stats?.avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m18 15-6-6-6 6"/></svg>
                +0.1
              </span>
            )}
          </div>
          <div className="font-serif text-3xl font-bold text-gray-900 mb-1">{stats?.avgRating || 0}</div>
          <p className="text-gray-600 font-medium text-sm mb-1">Avg Rating</p>
          <p className="text-gray-400 text-xs">{stats?.totalReviews || 0} total reviews</p>
        </Link>

        

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <IndianRupee size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m18 15-6-6-6 6"/></svg>
              +12%
            </span>
          </div>
          <div className="font-serif text-3xl font-bold text-gray-900 mb-1">₹{stats?.monthlyRevenue || 0}</div>
          <p className="text-gray-600 font-medium text-sm mb-1">Monthly Revenue</p>
          <p className="text-gray-400 text-xs">{stats?.totalConsultations || 0} consultations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-gray-900">Today's Schedule</h2>
            <Link href="/doctor/appointments" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600">No appointments today</p>
                <p className="text-sm">You're all set for today!</p>
              </div>
            ) : (
              appointments.map((app, index) => (
                <div 
                  key={app.id} 
                  className={`p-4 ${index < appointments.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${app.patientColor || 'bg-gray-400'} text-white flex items-center justify-center font-bold shrink-0`}>
                        {app.patientInitials || '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{app.patientName}</h4>
                        <p className="text-xs text-gray-500">{app.age} yrs · {app.condition}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="font-bold text-gray-900 text-sm">{app.time}</div>
                      <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${getStatusColor(app.status)}`}>
                        {app.isConfirmed ? <Check size={14} /> : null}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <Link href="/doctor/appointments" className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-opacity flex items-center justify-center gap-2">
                <Calendar size={16} /> Manage All Appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Recent Activity</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No recent activity</p>
            ) : (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div 
                  key={index} 
                  className={`relative pl-6 ${index < recentActivity.length - 1 ? 'pb-6 border-l-2 border-gray-100' : ''}`}
                >
                  <div 
                    className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2"
                    style={{ 
                      backgroundColor: activity.color + '20',
                      borderColor: activity.color 
                    }}
                  ></div>
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Reviews */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Recent Reviews</h2>
          <Link href="/doctor/reviews" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        
        {recentReviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {recentReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.patientColor || 'bg-gray-400'} text-white flex items-center justify-center font-bold text-sm`}>
                      {review.patientInitials || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{review.patientName}</h4>
                      <p className="text-xs text-gray-400">{review.time}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{review.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/doctor/profile" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
            <div className="text-gray-900 mb-2"><User size={24} /></div>
            <h4 className="font-bold text-gray-900 text-sm">Edit Profile</h4>
            <p className="text-xs text-gray-400">Update your info</p>
          </Link>
          <Link href="/doctor/reviews" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
            <div className="text-amber-500 mb-2"><Star size={24} fill="currentColor" /></div>
            <h4 className="font-bold text-gray-900 text-sm">All Reviews</h4>
            <p className="text-xs text-gray-400">Reply to patients</p>
          </Link>
          <Link href="/doctor/appointments" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
            <div className="text-purple-600 mb-2"><Calendar size={24} /></div>
            <h4 className="font-bold text-gray-900 text-sm">Appointments</h4>
            <p className="text-xs text-gray-400">Manage schedule</p>
          </Link>
          <Link href="/doctor/plans" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
            <div className="text-amber-500 mb-2"><Zap size={24} fill="currentColor" /></div>
            <h4 className="font-bold text-gray-900 text-sm">Plans</h4>
            <p className="text-xs text-gray-400">Upgrade for more</p>
          </Link>
        </div>
      </div>
    </div>
  );
}