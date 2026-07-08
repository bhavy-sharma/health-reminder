// app/doctor/(protected)/appointments/page.jsx
"use client";

import { useState, useEffect } from "react";
import { 
  Bell, Search, Plus, MapPin, Video, Check, Clock, X, Calendar, Phone, 
  Loader2, AlertCircle, CheckCircle, XCircle 
} from "lucide-react";
import Link from "next/link";

export default function DoctorAppointments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApt, setSelectedApt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ all: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        status: activeTab,
        type: activeType,
        search: searchQuery,
      });

      const response = await fetch(`/api/doctor/appointments?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch appointments');
      }

      if (result.success) {
        setAppointments(result.data.appointments || []);
        setCounts(result.data.counts || { all: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0 });
      } else {
        throw new Error(result.error || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchAppointments();
    }
  }, [activeTab, activeType, searchQuery]);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/doctor/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      if (result.success) {
        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: newStatus } : apt
        ));
        if (selectedApt && selectedApt.id === id) {
          setSelectedApt({ ...selectedApt, status: newStatus });
        }
        // Refresh counts
        fetchAppointments();
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApts = appointments;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Appointments</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">Appointments</span>
        </div>
        <button className="relative p-2 text-gray-700 hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-1">Appointments</h1>
          <p className="text-gray-500">{counts.confirmed || 0} confirmed · {counts.pending || 0} pending confirmation</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient or condition..." 
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex bg-white rounded-full border border-gray-200 p-1 shrink-0 shadow-sm">
          <button 
            onClick={() => setActiveType("all")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "all" ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-900"}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveType("in-person")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "in-person" ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-900"}`}
          >
            In-Person
          </button>
          <button 
            onClick={() => setActiveType("video")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "video" ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-900"}`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex bg-gray-50 p-2 rounded-2xl mb-6 w-full border border-gray-200 overflow-x-auto gap-2">
        {[
          { id: "all", label: "All", count: counts.all },
          { id: "pending", label: "Pending", count: counts.pending },
          { id: "confirmed", label: "Confirmed", count: counts.confirmed },
          { id: "completed", label: "Completed", count: counts.completed },
          { id: "cancelled", label: "Cancelled", count: counts.cancelled }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm
              ${activeTab === tab.id 
                ? "bg-white text-gray-900" 
                : "text-gray-400 hover:text-gray-900 hover:bg-white/50 shadow-none border-transparent"
              }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.id ? "bg-gray-100 text-gray-600 border border-gray-200" : "bg-gray-200 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className={`grid grid-cols-1 ${selectedApt ? 'lg:grid-cols-3' : ''} gap-6`}>
        
        {/* Appointments List */}
        <div className={`space-y-4 ${selectedApt ? 'lg:col-span-2' : ''}`}>
          {filteredApts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Calendar size={32} />
              </div>
              <p className="text-gray-600 font-medium">No appointments match your filters</p>
            </div>
          ) : (
            filteredApts.map((apt) => (
              <div 
                key={apt.id} 
                onClick={() => setSelectedApt(apt)}
                className={`bg-white rounded-xl p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative
                  ${selectedApt?.id === apt.id ? 'border-2 border-gray-900' : 'border border-gray-200 hover:border-gray-400'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full ${apt.color || 'bg-gray-400'} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                    {apt.initials || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{apt.patient}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {apt.age} · {apt.condition}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} /> {apt.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} /> {apt.time}
                      </div>
                      <div className={`flex items-center gap-1.5 ${apt.type === 'video' ? 'text-purple-600' : ''}`}>
                        {apt.type === 'in-person' ? <MapPin size={14} /> : <Video size={14} />} 
                        {apt.type === 'in-person' ? 'In-Person' : 'Video'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end md:self-auto">
                  {apt.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(apt.id, "confirmed");
                      }}
                      disabled={updating}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <CheckCircle size={14} />
                      Confirm
                    </button>
                  )}
                  <div className="md:absolute top-5 right-5 flex items-center justify-end">
                    {apt.status === "confirmed" ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs bg-emerald-50 px-3 py-1 rounded-full">
                        Confirmed
                      </span>
                    ) : apt.status === "pending" ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold text-xs bg-amber-50 px-3 py-1 rounded-full">
                        Pending
                      </span>
                    ) : apt.status === "cancelled" ? (
                      <span className="flex items-center gap-1 text-red-500 font-semibold text-xs bg-red-50 px-3 py-1 rounded-full">
                        Cancelled
                      </span>
                    ) : apt.status === "completed" ? (
                      <span className="flex items-center gap-1 text-blue-500 font-semibold text-xs bg-blue-50 px-3 py-1 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 font-semibold text-xs bg-gray-50 px-3 py-1 rounded-full">
                        {apt.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details Side Panel */}
        {selectedApt && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-fit sticky top-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900">Details</h2>
              </div>
              <button 
                onClick={() => setSelectedApt(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${selectedApt.color || 'bg-gray-400'} text-white flex items-center justify-center font-bold text-xl`}>
                  {selectedApt.initials || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{selectedApt.patient}</h3>
                  <p className="text-gray-400 text-sm mb-2">{selectedApt.age} old</p>
                  
                  {selectedApt.status === "confirmed" && <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded-md">Confirmed</span>}
                  {selectedApt.status === "pending" && <span className="text-amber-500 font-semibold text-xs bg-amber-50 px-2 py-1 rounded-md">Pending</span>}
                  {selectedApt.status === "cancelled" && <span className="text-red-500 font-semibold text-xs bg-red-50 px-2 py-1 rounded-md">Cancelled</span>}
                  {selectedApt.status === "completed" && <span className="text-blue-500 font-semibold text-xs bg-blue-50 px-2 py-1 rounded-md">Completed</span>}
                </div>
              </div>

              {/* Action Buttons for Pending */}
              {selectedApt.status === "pending" && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => updateStatus(selectedApt.id, "confirmed")}
                    disabled={updating}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle size={18} />
                    Confirm Appointment
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this appointment?')) {
                        updateStatus(selectedApt.id, "cancelled");
                      }
                    }}
                    disabled={updating}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle size={18} />
                    Cancel
                  </button>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
                <div className="text-gray-400 flex items-center gap-2">
                  📄 Condition
                </div>
                <div className="font-bold text-gray-900">{selectedApt.condition}</div>
                
                <div className="text-gray-400 flex items-center gap-2">
                  <Calendar size={14} className="ml-0.5" /> Date
                </div>
                <div className="font-bold text-gray-900">{selectedApt.date}</div>
                
                <div className="text-gray-400 flex items-center gap-2">
                  <Clock size={14} className="ml-0.5" /> Time
                </div>
                <div className="font-bold text-gray-900">{selectedApt.time}</div>
                
                <div className="text-gray-400 flex items-center gap-2">
                  <MapPin size={14} className="ml-0.5" /> Type
                </div>
                <div className="font-bold text-gray-900">
                  {selectedApt.type === 'in-person' ? 'In-Person' : 'Video'}
                </div>

                <div className="text-gray-400 flex items-center gap-2">
                  <Calendar size={14} className="ml-0.5" /> Fee
                </div>
                <div className="font-bold text-gray-900">₹{selectedApt.fee || 0}</div>
              </div>

              {/* Notes Section */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Doctor's Note</p>
                <textarea 
                  placeholder="Add a private note..."
                  className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-gray-900"
                  defaultValue={selectedApt.notes || ''}
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-2">
                {selectedApt.status === "confirmed" && (
                  <button 
                    onClick={() => updateStatus(selectedApt.id, "completed")}
                    disabled={updating}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={18} />} 
                    Mark Complete
                  </button>
                )}
                
                <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/91${selectedApt.phone}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-50 text-emerald-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg> 
                    WhatsApp
                  </a>
                  <a 
                    href={`tel:+91${selectedApt.phone}`}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-gray-400 transition-all"
                  >
                    <Phone size={16} /> Call
                  </a>
                </div>

                {selectedApt.status !== "cancelled" && selectedApt.status !== "completed" && selectedApt.status !== "pending" && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this appointment?')) {
                        updateStatus(selectedApt.id, "cancelled");
                      }
                    }}
                    disabled={updating}
                    className="w-full text-red-500 bg-red-50 py-3 rounded-xl font-bold hover:bg-red-100 transition-all mt-2 disabled:opacity-50"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}