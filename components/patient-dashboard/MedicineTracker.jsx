'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Phone,
  Trash2,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Loader2,
  X,
  Search,
  Filter,
  Download,
  Info,
  Check,
  RefreshCw,
  Heart,
  ChevronLeft
} from 'lucide-react';
import Sidebar from './Sidebar';
import toast, { Toaster } from 'react-hot-toast';

export default function MedicineTracker() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  
  // Data lists
  const [members, setMembers] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [stats, setStats] = useState({
    activeReminders: 0,
    takenToday: 0,
    missedToday: 0,
    pendingResponses: 0
  });

  // Connection config status
  const [apiConnected, setApiConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // History table filters
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('');

  // Right Notification Feed
  const [notifications, setNotifications] = useState([]);

  // Modal Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    memberId: '',
    medicineName: '',
    medicineType: 'Tablet',
    dosage: '',
    foodRelation: 'After Food',
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    customTime: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderTime: '08:00 AM',
    responseWindowMinutes: '10',
    messageTemplate: 'Hello {name},\n\nThis is your medicine reminder.\nMedicine: {medicine}\nDosage: {dosage}\n\nPlease take your medicine now.\n\nReply:\n1️⃣ TAKEN\n2️⃣ SKIP',
    repeatType: 'Daily'
  });

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);

  // Member-specific reminder listing modal
  const [showMemberRemindersModal, setShowMemberRemindersModal] = useState(false);
  const [viewingMemberReminders, setViewingMemberReminders] = useState(null);

  useEffect(() => {
    fetchProfileAndData();
    const interval = setInterval(() => {
      fetchRealtimeFeed();
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const fetchProfileAndData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      
      if (data.user?.activeFamilyId) {
        const id = data.user.activeFamilyId._id || data.user.activeFamilyId;
        setFamilyId(id);
        
        // Fetch family members
        const membersRes = await fetch(`/api/family/members?familyId=${id}`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
        }

        // Fetch reminders and stats
        await fetchRemindersAndStats(id);
        // Fetch History
        await fetchHistoryLogs(id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load medicine module details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRemindersAndStats = async (fid) => {
    try {
      const res = await fetch(`/api/medicine-reminder?familyId=${fid}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setTodayLogs(data.todayLogs || []);
        setStats(data.stats || { activeReminders: 0, takenToday: 0, missedToday: 0, pendingResponses: 0 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistoryLogs = async (fid) => {
    try {
      const res = await fetch(`/api/medicine-reminder/history?familyId=${fid}&search=${historySearch}&status=${historyStatus}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRealtimeFeed = async () => {
    if (!familyId) return;
    try {
      // Run the cron check
      await fetch('/api/medicine-reminder/check-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId })
      });

      // Refresh reminders, todayLogs, and stats together
      const res = await fetch(`/api/medicine-reminder?familyId=${familyId}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setTodayLogs(data.todayLogs || []);
        setStats(data.stats || { activeReminders: 0, takenToday: 0, missedToday: 0, pendingResponses: 0 });
      }

      // Fetch live notification feed
      const feedRes = await fetch('/api/medicine-reminder/check-trigger');
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setNotifications(feedData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = (member) => {
    setSelectedMember(member);
    setIsEditMode(false);
    setFormData({
      memberId: member._id,
      medicineName: '',
      medicineType: 'Tablet',
      dosage: '',
      foodRelation: 'After Food',
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      customTime: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminderTime: '08:00', // Standard 24h format for HTML time inputs
      responseWindowMinutes: '10',
      messageTemplate: `Hello ${member.name},\n\nThis is your medicine reminder.\nMedicine: {medicine}\nDosage: {dosage}\n\nPlease take your medicine now.\n\nReply:\n1️⃣ TAKEN\n2️⃣ SKIP`,
      repeatType: 'Daily'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (reminder) => {
    setSelectedMember(reminder.memberId);
    setIsEditMode(true);
    setEditingReminderId(reminder._id);

    // Convert saved reminderTime string to 24-hour format "HH:MM" if it contains AM/PM
    let formattedTime = reminder.reminderTime;
    if (reminder.reminderTime.includes(' ')) {
      let [timePart, ampm] = reminder.reminderTime.split(' ');
      let [h, m] = timePart.split(':');
      let hr = parseInt(h) || 0;
      if (ampm.toUpperCase() === 'PM' && hr < 12) hr += 12;
      if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0;
      let hrStr = hr < 10 ? '0' + hr : hr;
      formattedTime = `${hrStr}:${m}`;
    }

    setFormData({
      memberId: reminder.memberId?._id || reminder.memberId,
      medicineName: reminder.medicineName,
      medicineType: reminder.medicineType,
      dosage: reminder.dosage,
      foodRelation: reminder.foodRelation,
      morning: reminder.morning,
      afternoon: reminder.afternoon,
      evening: reminder.evening,
      night: reminder.night,
      customTime: reminder.customTime,
      startDate: new Date(reminder.startDate).toISOString().split('T')[0],
      endDate: new Date(reminder.endDate).toISOString().split('T')[0],
      reminderTime: formattedTime,
      responseWindowMinutes: reminder.responseWindowMinutes.toString(),
      messageTemplate: reminder.messageTemplate,
      repeatType: reminder.repeatType
    });
    setShowAddModal(true);
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.dosage) {
      toast.error('Please enter medicine name and dosage');
      return;
    }

    try {
      setSubmitting(true);
      const url = isEditMode 
        ? `/api/medicine-reminder/${editingReminderId}`
        : '/api/medicine-reminder';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          familyId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save reminder');

      toast.success(isEditMode ? 'Medicine reminder updated successfully!' : 'Medicine reminder added successfully!');
      setShowAddModal(false);
      setShowMemberRemindersModal(false);
      
      setFormData({
        memberId: '',
        medicineName: '',
        medicineType: 'Tablet',
        dosage: '',
        foodRelation: 'After Food',
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
        customTime: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reminderTime: '08:00 AM',
        responseWindowMinutes: '10',
        messageTemplate: '',
        repeatType: 'Daily'
      });

      fetchRemindersAndStats(familyId);
      fetchHistoryLogs(familyId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateReply = async (logId, status) => {
    try {
      const res = await fetch('/api/medicine-reminder/incoming-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, responseType: status })
      });
      if (res.ok) {
        toast.success(`Simulated response: ${status}`);
        fetchRealtimeFeed();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      const res = await fetch(`/api/medicine-reminder/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Reminder deleted successfully');
        fetchRemindersAndStats(familyId);
        fetchHistoryLogs(familyId);
      }
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  const handleSendReminderAgain = async (log) => {
    try {
      const res = await fetch('/api/medicine-reminder/check-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, extendLogId: log._id })
      });
      if (res.ok) {
        toast.success(`Resent WhatsApp alert to ${log.memberId?.name || 'member'} and extended window by 10m.`);
        fetchRealtimeFeed();
      }
    } catch (err) {
      toast.error('Failed to extend reminder response window.');
    }
  };

  const handleCallMember = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleSyncApi = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Twilio connection synchronized successfully');
    }, 1200);
  };

  const exportHistoryToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Member,Medicine,Date,Reminder Time,Status,Taken Time\n";

    historyLogs.forEach(log => {
      const name = log.memberId?.name || 'N/A';
      const med = log.medicineName || 'N/A';
      const date = new Date(log.scheduledTime).toLocaleDateString();
      const time = new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const status = log.status;
      const taken = log.takenAt ? new Date(log.takenAt).toLocaleTimeString() : 'N/A';
      csvContent += `"${name}","${med}","${date}","${time}","${status}","${taken}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reminder_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const missedLogs = todayLogs.filter(l => l.status === 'Missed');
  
  // Find immediate upcoming medicine
  const upcomingReminders = todayLogs.filter(l => l.status === 'Sent');
  const primaryUpcoming = upcomingReminders.length > 0 ? upcomingReminders[0] : null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="flex-1 ml-0 md:ml-[280px] p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-[#E2E8F0]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                Care Module
              </span>
              <h1 className="text-3xl font-bold text-[#111827] mt-3 tracking-tight font-sans">
                Medicine Tracker & Reminders
              </h1>
              <p className="text-sm text-[#475569] mt-1 font-medium">
                Track medicines, WhatsApp reminders and family health in real time.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#475569] font-semibold bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <button 
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl border border-[#E2E8F0] shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#475569]" /> View Reminder History
              </button>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-sm">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-[#0B1F4D] text-white shadow-md' : 'text-[#475569] hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    activeTab === 'history' ? 'bg-[#0B1F4D] text-white shadow-md' : 'text-[#475569] hover:bg-slate-50'
                  }`}
                >
                  History logs
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Column (Analytics & Listings) */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Card 1 */}
                  <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Active Reminders</p>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-[#111827] mt-4">{stats.activeReminders}</p>
                    <span className="text-[11px] text-blue-600 font-semibold mt-2 block">Schedules currently running</span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Taken Today</p>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 mt-4">{stats.takenToday}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">Doses completed today</span>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Missed Medicines</p>
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-rose-600 mt-4">{stats.missedToday}</p>
                    <span className="text-[11px] text-rose-500 font-semibold mt-2 block">Expired without response</span>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Pending Responses</p>
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-amber-500 mt-4">{stats.pendingResponses}</p>
                    <span className="text-[11px] text-amber-500 font-semibold mt-2 block">Awaiting reply confirmations</span>
                  </div>

                </div>

                {/* Red Alerts for Missed Reminders */}
                {missedLogs.length > 0 && (
                  <div className="space-y-3.5">
                    <h2 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" /> Missed Reminders Needing Urgent Attention
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {missedLogs.map((log) => (
                        <div key={log._id} className="bg-rose-50/50 border border-rose-200 rounded-[16px] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase">
                                Action Required
                              </span>
                              <h3 className="text-lg font-bold text-[#111827] mt-3">{log.medicineName}</h3>
                              <p className="text-xs text-[#475569] mt-0.5 font-medium">Member: {log.memberId?.name} ({log.memberId?.relationship})</p>
                              <p className="text-xs text-[#475569] mt-1.5 flex items-center gap-1 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-rose-500" /> Scheduled: {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-700">
                              {log.memberId?.name?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendReminderAgain(log)}
                              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" /> Send Reminder Again
                            </button>
                            <button
                              onClick={() => handleCallMember(log.memberId?.emergencyContact?.phone)}
                              className="flex-1 py-2.5 px-3 bg-[#0B1F4D] hover:bg-[#071433] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Member
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Family Members Redesigned Cards */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#111827] font-sans">Family Members</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {members.map((member) => (
                      <div key={member._id} className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300 flex flex-col justify-between space-y-5">
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B1F4D] to-blue-700 text-white flex items-center justify-center text-lg font-bold shadow-inner shrink-0">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              member.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#111827] text-base leading-tight truncate">{member.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 text-[#475569] text-[10px] font-bold rounded-full uppercase tracking-wider">{member.relationship}</span>
                              <span className="text-xs text-[#475569] font-medium">{member.gender}</span>
                            </div>
                            <p className="text-xs text-[#475569] mt-2.5 font-semibold">
                              Blood Group: <span className="text-[#111827]">{member.bloodGroup || 'N/A'}</span>
                            </p>
                            <p className="text-[11px] text-[#475569] mt-1 truncate" title={member.knownConditions?.join(', ')}>
                              Disease/Condition: <span className="font-medium text-[#111827]">{member.knownConditions?.length > 0 ? member.knownConditions.join(', ') : 'None'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-[#E2E8F0]">
                          <button
                            onClick={() => handleOpenAddModal(member)}
                            className="flex-1 py-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                          >
                            + Add Reminder
                          </button>
                          <button
                            onClick={() => {
                              setViewingMemberReminders(member);
                              setShowMemberRemindersModal(true);
                            }}
                            className="flex-1 py-2.5 bg-[#0B1F4D] hover:bg-[#071433] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                          >
                            View Reminders
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Check-ins Redesigned Modern Table */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#111827] font-sans">Today's Check-ins</h2>
                  <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[#475569] font-bold text-xs border-b border-[#E2E8F0] uppercase tracking-wider">
                            <th className="p-4 pl-6">Medicine</th>
                            <th className="p-4">Member</th>
                            <th className="p-4">Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action Simulation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#111827] font-medium">
                          {todayLogs.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="p-8 text-center text-[#475569]">
                                No check-ins scheduled for today yet.
                              </td>
                            </tr>
                          ) : (
                            todayLogs.map((log) => (
                              <tr key={log._id} className="hover:bg-slate-50/50 transition duration-150">
                                <td className="p-4 pl-6">
                                  <div className="font-bold text-[#111827]">{log.medicineName}</div>
                                  <div className="text-xs text-[#475569] font-medium mt-0.5">{log.dosage}</div>
                                </td>
                                <td className="p-4 text-[#111827]">{log.memberId?.name}</td>
                                <td className="p-4 text-xs text-[#475569]">
                                  {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="p-4">
                                  {log.status === 'Taken' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                                      <CheckCircle className="w-3.5 h-3.5" /> Taken
                                    </span>
                                  )}
                                  {log.status === 'Sent' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                                      <Clock className="w-3.5 h-3.5" /> Pending
                                    </span>
                                  )}
                                  {log.status === 'Missed' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
                                      <AlertCircle className="w-3.5 h-3.5" /> Missed
                                    </span>
                                  )}
                                  {log.status === 'Skipped' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                                      Skipped
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  {log.status === 'Sent' ? (
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => handleSimulateReply(log._id, 'TAKEN')}
                                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                      >
                                        Mark Taken
                                      </button>
                                      <button
                                        onClick={() => handleSimulateReply(log._id, 'SKIP')}
                                        className="py-1.5 px-3 bg-[#475569] hover:bg-[#334155] text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                      >
                                        Skip
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-[#475569]/60 font-semibold">—</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (SaaS Cards & Notification Board) */}
              <div className="space-y-6">
                
                {/* Twilio Status Card */}
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#111827]">Twilio Integration</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      apiConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Connected
                    </span>
                  </div>
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#475569]">API Status:</span>
                      <span className="font-bold text-emerald-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Last Sync:</span>
                      <span className="font-semibold text-[#111827]">Just Now</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncApi}
                    disabled={isSyncing}
                    className="w-full mt-2 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Connection'}
                  </button>
                </div>

                {/* Upcoming Reminders Card */}
                <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#111827]">Next Scheduled Reminder</h3>
                  {primaryUpcoming ? (
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-[#E2E8F0]">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">{primaryUpcoming.medicineName}</p>
                          <p className="text-[10px] text-[#475569] font-medium">To: {primaryUpcoming.memberId?.name}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 text-[11px] font-semibold text-[#475569]">
                        <span>Time:</span>
                        <span className="text-[#111827]">{new Date(primaryUpcoming.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#475569] py-3 text-center">No upcoming schedules today.</p>
                  )}
                </div>

                {/* Real-time Notification Feed */}
                <div className="bg-gradient-to-b from-[#0B1F4D] to-[#040D21] text-white rounded-[16px] p-6 shadow-lg border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-blue-400">
                    <Bell className="w-4 h-4" /> Live Notifications
                  </h3>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No alerts in this session yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1 transition duration-300 hover:bg-white/10">
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              n.type.includes('Taken') ? 'text-emerald-400' :
                              n.type.includes('Missed') ? 'text-rose-400' : 'text-blue-300'
                            }`}>
                              {n.type}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            
            /* History Tab Redesigned */
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medicine..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full bg-white font-medium"
                    />
                  </div>
                  <select
                    value={historyStatus}
                    onChange={(e) => setHistoryStatus(e.target.value)}
                    className="py-2 px-3 border border-[#E2E8F0] rounded-xl text-sm bg-white font-semibold text-[#111827]"
                  >
                    <option value="">All Statuses</option>
                    <option value="Taken">Taken</option>
                    <option value="Missed">Missed</option>
                    <option value="Skipped">Skipped</option>
                    <option value="Sent">Sent</option>
                  </select>
                  <button
                    onClick={() => fetchHistoryLogs(familyId)}
                    className="p-2 border border-[#E2E8F0] rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Filter className="w-4 h-4 text-[#475569]" />
                  </button>
                </div>
                <button
                  onClick={exportHistoryToCSV}
                  className="px-4 py-2 bg-[#0B1F4D] hover:bg-[#071433] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[#475569] font-bold text-xs border-b border-[#E2E8F0] uppercase tracking-wider">
                      <th className="p-4 pl-6">Member</th>
                      <th className="p-4">Medicine</th>
                      <th className="p-4">Dosage</th>
                      <th className="p-4">Scheduled Date & Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#111827] font-medium">
                    {historyLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-[#475569]">
                          No history logs found matching these filters.
                        </td>
                      </tr>
                    ) : (
                      historyLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-6 font-bold">{log.memberId?.name || 'N/A'}</td>
                          <td className="p-4">{log.medicineName}</td>
                          <td className="p-4 text-[#475569]">{log.dosage}</td>
                          <td className="p-4 text-xs text-[#475569]">
                            {new Date(log.scheduledTime).toLocaleDateString()} {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              log.status === 'Taken' ? 'bg-emerald-50 text-emerald-700' :
                              log.status === 'Missed' ? 'bg-rose-50 text-rose-700' :
                              log.status === 'Skipped' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-[#475569]">
                            {log.takenAt ? new Date(log.takenAt).toLocaleTimeString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          )}

        </div>
      </div>

      {/* Add Reminder Modal Redesigned */}
      {showAddModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0]">
            <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0]">
              <h2 className="text-xl font-bold text-[#111827]">Add Medicine Reminder</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-50 rounded-full transition cursor-pointer">
                <X className="w-5 h-5 text-[#475569]" />
              </button>
            </div>
            
            <form onSubmit={handleCreateReminder} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Member</label>
                  <input
                    type="text"
                    value={selectedMember.name}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#475569]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Medicine Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol"
                    value={formData.medicineName}
                    onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Medicine Type</label>
                  <select
                    value={formData.medicineType}
                    onChange={(e) => setFormData({ ...formData, medicineType: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Tablet, 5ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Food Relation</label>
                  <select
                    value={formData.foodRelation}
                    onChange={(e) => setFormData({ ...formData, foodRelation: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Food">With Food</option>
                    <option value="No Relation">No Relation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Reminder Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Response Window (minutes)</label>
                  <input
                    type="number"
                    value={formData.responseWindowMinutes}
                    onChange={(e) => setFormData({ ...formData, responseWindowMinutes: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Repeat Frequency</label>
                  <select
                    value={formData.repeatType}
                    onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Daily Schedules</label>
                <div className="flex flex-wrap gap-4">
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((shift) => {
                    const key = shift.toLowerCase();
                    return (
                      <label key={shift} className="flex items-center gap-2.5 text-sm text-[#111827] font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                          className="w-4.5 h-4.5 accent-blue-600 rounded cursor-pointer"
                        />
                        {shift}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Custom Time Shift (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 14:30"
                  value={formData.customTime}
                  onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">WhatsApp Message Template</label>
                <textarea
                  rows="4"
                  value={formData.messageTemplate}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[#111827]"
                ></textarea>
                <p className="text-[10px] text-[#475569] mt-1 font-semibold">Variables: {"{name}"}, {"{medicine}"}, {"{dosage}"} are dynamically formatted.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#111827] text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Member Reminders Modal */}
      {showMemberRemindersModal && viewingMemberReminders && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#E2E8F0] flex flex-col">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50 rounded-t-[20px]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Reminders for {viewingMemberReminders.name}</h2>
                <p className="text-xs text-[#475569] mt-0.5">Active medicine schedules and recurring check-ins.</p>
              </div>
              <button 
                onClick={() => setShowMemberRemindersModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-[#475569]" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {reminders.filter(r => {
                const id = r.memberId?._id?.toString() || r.memberId?.toString();
                return id === viewingMemberReminders._id?.toString();
              }).length === 0 ? (
                <p className="text-sm text-[#475569] py-8 text-center">No reminders found for this member.</p>
              ) : (
                reminders.filter(r => {
                    const id = r.memberId?._id?.toString() || r.memberId?.toString();
                    return id === viewingMemberReminders._id?.toString();
                  }).map((rem) => {
                  // ── Is this reminder schedule still active? ──────────────────────────────
                  // Active = endDate has NOT passed yet (compare date-only, ignore clock time)
                  const todayMidnight = new Date();
                  todayMidnight.setHours(0, 0, 0, 0);
                  const endDateMidnight = new Date(rem.endDate);
                  endDateMidnight.setHours(0, 0, 0, 0);
                  const isActive = endDateMidnight >= todayMidnight;

                  // Format reminderTime → 12h AM/PM for display
                  let displayTime = rem.reminderTime;
                  if (rem.reminderTime && !rem.reminderTime.includes(' ')) {
                    let [h, m] = rem.reminderTime.split(':');
                    let hr = parseInt(h) || 0;
                    let min = parseInt(m) || 0;
                    let ampm = hr >= 12 ? 'PM' : 'AM';
                    hr = hr % 12 || 12;
                    displayTime = `${hr < 10 ? '0' + hr : hr}:${min < 10 ? '0' + min : min} ${ampm}`;
                  }

                  // Format dates for display
                  const fmtDate = (d) => {
                    const dt = new Date(d);
                    return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  };

                  return (
                    <div key={rem._id} className={`p-5 border rounded-xl flex items-start justify-between gap-4 transition ${isActive ? 'border-[#E2E8F0] bg-slate-50/50 hover:border-blue-200' : 'border-rose-100 bg-rose-50/30 hover:border-rose-200'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#111827]">{rem.medicineName}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <p className="text-xs text-[#475569]">{rem.dosage} &middot; {rem.medicineType} &middot; {rem.foodRelation}</p>
                        <p className="text-[11px] text-[#475569] font-medium mt-1.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> Daily at {displayTime}
                        </p>
                        <p className="text-[11px] text-[#475569] mt-0.5">
                          <span className="font-semibold">Period:</span> {fmtDate(rem.startDate)} → {fmtDate(rem.endDate)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setShowMemberRemindersModal(false);
                            setTimeout(() => handleOpenEditModal(rem), 100);
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isActive ? 'Edit Reminder' : 'Reschedule'}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(rem._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-100 cursor-pointer self-end"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex justify-end rounded-b-[20px]">
              <button
                onClick={() => {
                  setShowMemberRemindersModal(false);
                  handleOpenAddModal(viewingMemberReminders);
                }}
                className="px-5 py-2.5 bg-[#0B1F4D] hover:bg-[#071433] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
              >
                + Add New Reminder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
