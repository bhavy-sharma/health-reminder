"use client";

import { useState } from "react";
import { Bell, Search, Plus, MapPin, Video, Check, Clock, X, Calendar, Phone } from "lucide-react";
import Link from "next/link";

export default function DoctorAppointments() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApt, setSelectedApt] = useState(null);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "Ramesh Sharma",
      initials: "RS",
      color: "bg-[#4a9e7f]",
      age: "62 yrs",
      condition: "Chest Pain Follow-up",
      date: "Today",
      time: "4:30 PM",
      type: "in-person",
      status: "confirmed",
      phone: "9876543210"
    },
    {
      id: 2,
      patient: "Anita Kulkarni",
      initials: "AK",
      color: "bg-[#e9a84c]",
      age: "45 yrs",
      condition: "BP Management",
      date: "Today",
      time: "5:00 PM",
      type: "in-person",
      status: "confirmed",
      phone: "9876543211"
    },
    {
      id: 3,
      patient: "Vijay Patel",
      initials: "VP",
      color: "bg-[#e8403a]",
      age: "55 yrs",
      condition: "Post Angioplasty Check",
      date: "Today",
      time: "5:30 PM",
      type: "in-person",
      status: "pending",
      phone: "9876543212"
    },
    {
      id: 4,
      patient: "Sunita Rao",
      initials: "SR",
      color: "bg-[#0d1b2a]",
      age: "38 yrs",
      condition: "Palpitations",
      date: "Tomorrow",
      time: "10:00 AM",
      type: "video",
      status: "confirmed",
      phone: "9876543213"
    },
    {
      id: 5,
      patient: "Deepak Mehta",
      initials: "DM",
      color: "bg-[#4a9e7f]",
      age: "70 yrs",
      condition: "Routine Cardiac Review",
      date: "Tomorrow",
      time: "11:00 AM",
      type: "in-person",
      status: "pending",
      phone: "9876543214"
    }
  ]);

  const updateStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    if (selectedApt && selectedApt.id === id) {
      setSelectedApt({ ...selectedApt, status: newStatus });
    }
  };

  const filteredApts = appointments.filter(apt => {
    const matchesTab = activeTab === "all" || apt.status === activeTab;
    const matchesType = activeType === "all" || apt.type === activeType;
    const matchesSearch = apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.condition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  const tabCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="p-8 pb-20 h-screen overflow-y-auto bg-[var(--color-cream)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-[var(--color-navy)] font-bold">Appointments</span>
        </div>
        <button className="relative p-2 text-[var(--color-navy)] hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-pulse-red)] rounded-full border-2 border-[var(--color-cream)]"></span>
        </button>
      </div>

      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-1">Appointments</h1>
          <p className="text-[var(--color-text-muted)]">{tabCounts.confirmed} confirmed · {tabCounts.pending} pending confirmation</p>
        </div>
        <button className="bg-[var(--color-navy)] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-opacity flex items-center gap-2 self-start md:self-auto shadow-sm">
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient or condition..." 
            className="w-full pl-11 pr-4 py-3 rounded-full border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-sm shadow-sm"
          />
        </div>
        <div className="flex bg-white rounded-full border border-[var(--color-border)] p-1 shrink-0 shadow-sm">
          <button 
            onClick={() => setActiveType("all")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "all" ? "bg-[var(--color-cream)] text-[var(--color-navy)] shadow-sm border border-[var(--color-border)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveType("in-person")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "in-person" ? "bg-[var(--color-cream)] text-[var(--color-navy)] shadow-sm border border-[var(--color-border)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"}`}
          >
            In-Person
          </button>
          <button 
            onClick={() => setActiveType("video")}
            className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${activeType === "video" ? "bg-[var(--color-cream)] text-[var(--color-navy)] shadow-sm border border-[var(--color-border)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"}`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex bg-[#efebe4] p-2 rounded-2xl mb-6 w-full border border-[var(--color-border)] overflow-x-auto gap-2">
        {[
          { id: "all", label: "All", count: tabCounts.all },
          { id: "confirmed", label: "Confirmed", count: tabCounts.confirmed },
          { id: "pending", label: "Pending", count: tabCounts.pending },
          { id: "cancelled", label: "Cancelled", count: tabCounts.cancelled }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-sm
              ${activeTab === tab.id 
                ? "bg-white text-[var(--color-navy)]" 
                : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)] hover:bg-white/50 shadow-none border-transparent"
              }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.id ? "bg-[var(--color-cream)] text-[var(--color-text-secondary)] border border-[var(--color-border)]" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]"
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
            <div className="bg-white rounded-[var(--radius-card-lg)] p-12 border border-[var(--color-border)] shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-[var(--color-text-muted)] mb-4">
                <Calendar size={32} />
              </div>
              <p className="text-[var(--color-text-secondary)] font-medium">No appointments match your filters</p>
            </div>
          ) : (
            filteredApts.map((apt) => (
              <div 
                key={apt.id} 
                onClick={() => setSelectedApt(apt)}
                className={`bg-white rounded-[var(--radius-card-lg)] p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative
                  ${selectedApt?.id === apt.id ? 'border-2 border-[var(--color-navy)]' : 'border border-[var(--color-border)] hover:border-[var(--color-navy)]'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full ${apt.color} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                    {apt.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-navy)] text-lg mb-1">{apt.patient}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                      {apt.age} · {apt.condition}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--color-text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} /> {apt.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} /> {apt.time}
                      </div>
                      <div className={`flex items-center gap-1.5 ${apt.type === 'video' ? 'text-[#6c5ce7]' : ''}`}>
                        {apt.type === 'in-person' ? <MapPin size={14} /> : <Video size={14} />} 
                        {apt.type === 'in-person' ? 'In-Person' : 'Video'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:absolute top-5 right-5 flex items-center justify-end self-end md:self-auto">
                  {apt.status === "confirmed" ? (
                    <span className="flex items-center gap-1 text-[#4a9e7f] font-semibold text-xs bg-[#e6f4ef] px-3 py-1 rounded-full">
                      Confirmed
                    </span>
                  ) : apt.status === "pending" ? (
                    <span className="flex items-center gap-1 text-[#e9a84c] font-semibold text-xs bg-[#fef3e6] px-3 py-1 rounded-full">
                      Pending
                    </span>
                  ) : apt.status === "cancelled" ? (
                    <span className="flex items-center gap-1 text-[#e8403a] font-semibold text-xs bg-[#fdf2f2] px-3 py-1 rounded-full">
                      Cancelled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#6c757d] font-semibold text-xs bg-[#efebe4] px-3 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details Side Panel */}
        {selectedApt && (
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm flex flex-col h-fit sticky top-8">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start">
              <div>
                <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)]">Details</h2>
              </div>
              <button 
                onClick={() => setSelectedApt(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-pulse-red)] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${selectedApt.color} text-white flex items-center justify-center font-bold text-xl`}>
                  {selectedApt.initials}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-navy)] text-lg leading-tight mb-1">{selectedApt.patient}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-2">{selectedApt.age} old</p>
                  
                  {selectedApt.status === "confirmed" && <span className="text-[#4a9e7f] font-semibold text-xs bg-[#e6f4ef] px-2 py-1 rounded-md">Confirmed</span>}
                  {selectedApt.status === "pending" && <span className="text-[#e9a84c] font-semibold text-xs bg-[#fef3e6] px-2 py-1 rounded-md">Pending</span>}
                  {selectedApt.status === "cancelled" && <span className="text-[#e8403a] font-semibold text-xs bg-[#fdf2f2] px-2 py-1 rounded-md">Cancelled</span>}
                  {selectedApt.status === "completed" && <span className="text-[#6c757d] font-semibold text-xs bg-[#efebe4] px-2 py-1 rounded-md">Completed</span>}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
                <div className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className="w-4 flex justify-center text-lg">📄</span> Condition
                </div>
                <div className="font-bold text-[var(--color-navy)]">{selectedApt.condition}</div>
                
                <div className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <Calendar size={14} className="ml-0.5" /> Date
                </div>
                <div className="font-bold text-[var(--color-navy)]">{selectedApt.date}</div>
                
                <div className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <Clock size={14} className="ml-0.5" /> Time
                </div>
                <div className="font-bold text-[var(--color-navy)]">{selectedApt.time}</div>
                
                <div className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <MapPin size={14} className="ml-0.5" /> Type
                </div>
                <div className="font-bold text-[var(--color-navy)]">
                  {selectedApt.type === 'in-person' ? 'In-Person' : 'Video'}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Doctor's Note</p>
                <textarea 
                  placeholder="Add a private note..."
                  className="w-full h-24 bg-gray-50 border border-[var(--color-border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-2">
                {selectedApt.status !== "completed" && selectedApt.status !== "cancelled" && (
                  <button 
                    onClick={() => updateStatus(selectedApt.id, "completed")}
                    className="w-full bg-[var(--color-navy)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
                  >
                    <Check size={18} /> Mark Complete
                  </button>
                )}
                
                <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/91${selectedApt.phone}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#e6f4ef] text-[var(--color-sage-green)] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-80 transition-all border border-[var(--color-sage-green)]/20"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg> 
                    WhatsApp
                  </a>
                  <a 
                    href={`tel:+91${selectedApt.phone}`}
                    className="flex-1 bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[var(--color-navy)] transition-all"
                  >
                    <Phone size={16} /> Call
                  </a>
                </div>

                {selectedApt.status !== "cancelled" && selectedApt.status !== "completed" && (
                  <button 
                    onClick={() => updateStatus(selectedApt.id, "cancelled")}
                    className="w-full text-[#e8403a] bg-[#fdf2f2] py-3 rounded-xl font-bold hover:bg-opacity-80 transition-all mt-2"
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
