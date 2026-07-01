'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Pencil,
  Trash2,
  Plus,
  ShieldPlus,
  X,
  Loader2,
  FileUp,
  Heart,
  Calendar,
  User,
  Shield,
  Activity,
  HeartPulse,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Link from 'next/link';

const colorMap = {
  '#EF4444': 'bg-red-500',
  '#F59E0B': 'bg-amber-500',
  '#10B981': 'bg-emerald-500',
  '#3B82F6': 'bg-blue-500',
  '#8B5CF6': 'bg-purple-500',
  '#EC4899': 'bg-pink-500',
  '#14B8A6': 'bg-teal-500',
  '#F97316': 'bg-orange-500',
  '#6366F1': 'bg-indigo-500',
  '#84CC16': 'bg-lime-500',
  '#06B6D4': 'bg-cyan-500',
  '#D946EF': 'bg-fuchsia-500',
  '#6B7280': 'bg-gray-500',
};

const getColorClass = (hex) => colorMap[hex] || 'bg-gray-500';
const getInitials = (name) => name?.charAt(0).toUpperCase() || '';

const getAge = (dob) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const initialFormState = {
  name: '',
  relationship: 'other',
  dateOfBirth: '',
  gender: 'other',
  bloodGroup: '',
  email: '',
  knownConditions: '',
  allergies: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

const isProfileIncomplete = (m) => m.isPrimary && (!m.bloodGroup || new Date(m.dateOfBirth).getFullYear() === 2000);

export default function FamilyMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  const [familyDetails, setFamilyDetails] = useState(null);
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [selectedViewMember, setSelectedViewMember] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      
      if (data.user?.activeFamilyId) {
        const id = data.user.activeFamilyId._id || data.user.activeFamilyId;
        setFamilyId(id);
        
        // Fetch family details
        const detailsRes = await fetch(`/api/family/details?familyId=${id}`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          setFamilyDetails(detailsData.family);
        }

        // Fetch family members
        const membersRes = await fetch(`/api/family/members?familyId=${id}`);
        if (!membersRes.ok) throw new Error('Failed to fetch family members');
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    try {
      setCreatingFamily(true);
      setError(null);

      const res = await fetch('/api/family/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName: familyName || 'My Family Group' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to create family');

      setShowCreateFamilyModal(false);
      setFamilyName('');
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error creating family:', err);
      setError(err.message);
    } finally {
      setCreatingFamily(false);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.name || !formData.relationship || !formData.dateOfBirth || !formData.gender) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (!isEdit && !familyId) {
      setError('No family group found. Please create one first.');
      setShowCreateFamilyModal(true);
      setSubmitting(false);
      return;
    }

    const payload = {
      ...(isEdit ? {} : { familyId }),
      name: formData.name.trim(),
      relationship: formData.relationship,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup || undefined,
      email: formData.email ? formData.email.trim() : undefined,
      knownConditions: formData.knownConditions ? formData.knownConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      emergencyContact: {
        name: formData.emergencyContactName?.trim() || undefined,
        phone: formData.emergencyContactPhone?.trim() || undefined,
        emergencyContactRelation: formData.emergencyContactRelation?.trim() || undefined,
      },
    };
    if (avatarBase64) payload.avatarBase64 = avatarBase64;

    try {
      const url = isEdit ? `/api/family/members/${selectedMember._id}` : '/api/family/members';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'add'} member`);
      
      await fetchFamilyMembers();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedMember(null);
      setFormData(initialFormState);
      setAvatarBase64(null);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this family member?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/family/members/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchFamilyMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      relationship: member.relationship || 'other',
      dateOfBirth: member.dateOfBirth?.split('T')[0] || '',
      gender: member.gender || 'other',
      bloodGroup: member.bloodGroup || '',
      email: member.email || '',
      knownConditions: member.knownConditions?.join(', ') || '',
      allergies: member.allergies?.join(', ') || '',
      emergencyContactName: member.emergencyContact?.name || '',
      emergencyContactPhone: member.emergencyContact?.phone || '',
      emergencyContactRelation: member.emergencyContact?.relation || '',
      avatarUrl: member.avatarUrl || '',
    });
    setShowEditModal(true);
    setAvatarBase64(null);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const FormFields = useMemo(() => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setAvatarBase64(reader.result);
                reader.readAsDataURL(file);
              } else {
                setAvatarBase64(null);
              }
            }}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0D1B2A]/10 file:text-[#0D1B2A] hover:file:bg-[#0D1B2A]/20"
          />
          {(avatarBase64 || formData.avatarUrl) && (
            <div className="mt-2">
              <img src={avatarBase64 || formData.avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => updateFormData('name', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            placeholder="Enter full name" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
            <select 
              required 
              value={formData.relationship} 
              onChange={(e) => updateFormData('relationship', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white"
            >
              {['self','spouse','father','mother','son','daughter','grandfather','grandmother','other'].map(r => 
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select 
              required 
              value={formData.gender} 
              onChange={(e) => updateFormData('gender', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white"
            >
              {['male','female','other'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input 
              type="date" 
              required 
              value={formData.dateOfBirth} 
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select 
              value={formData.bloodGroup} 
              onChange={(e) => updateFormData('bloodGroup', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            placeholder="email@example.com" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Known Conditions (comma separated)</label>
          <input 
            type="text" 
            value={formData.knownConditions} 
            onChange={(e) => updateFormData('knownConditions', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            placeholder="e.g. Hypertension, Asthma" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
          <input 
            type="text" 
            value={formData.allergies} 
            onChange={(e) => updateFormData('allergies', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            placeholder="e.g. Peanuts, Penicillin" 
          />
        </div>

        <div className="border-t border-gray-100 pt-4 mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.emergencyContactName} 
                onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                placeholder="Full Name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={formData.emergencyContactPhone} 
                onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                placeholder="Phone number" 
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <input 
              type="text" 
              value={formData.emergencyContactRelation} 
              onChange={(e) => updateFormData('emergencyContactRelation', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
              placeholder="e.g. Sister, Friend" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button 
            type="button" 
            onClick={() => { setShowAddModal(false); setShowEditModal(false); setFormData(initialFormState); }}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#0D1B2A] hover:bg-[#1a2e44] rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Member'}
          </button>
        </div>
      </div>
    );
  }, [formData, submitting]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Sidebar />
      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 pt-16 md:pt-10 flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
          <p className="text-gray-500 font-medium">Loading Family Members...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Sidebar />
      
      <main className="md:pl-[280px]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Family Members</h1>
              <p className="text-gray-500 text-sm mt-1">Manage health records, credentials, and settings for your family group.</p>
            </div>
            {familyId && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white text-sm font-medium px-5 py-3 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Family Member
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between shadow-sm">
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {!familyId ? (
            /* No Family Setup Screen */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-2xl mx-auto mt-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-5" />
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">No Family Group Setup Yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Create a family group command center to start linking files, setting medicine reminders, and coordinating health schedules.
              </p>
              <button
                onClick={() => setShowCreateFamilyModal(true)}
                className="inline-flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white text-sm font-medium px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Family Group
              </button>
            </div>
          ) : (
            /* Main Content Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Members List */}
              <div className="lg:col-span-2 space-y-4">
                {members.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No family members found</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-[#0D1B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2e44] transition"
                    >
                      + Add First Member
                    </button>
                  </div>
                ) : (
                  <>
                  {selectedViewMember ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <button onClick={() => setSelectedViewMember(null)} className="mb-6 text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2">
                      ← Back to Members
                    </button>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          {selectedViewMember.avatarUrl ? (
                             <img src={selectedViewMember.avatarUrl} className="w-20 h-20 rounded-full object-cover shadow-sm border border-gray-100" />
                          ) : (
                             <div className={`w-20 h-20 rounded-full ${getColorClass(selectedViewMember.avatarColor)} text-white flex items-center justify-center text-3xl font-bold shadow-sm`}>
                               {getInitials(selectedViewMember.name)}
                             </div>
                          )}
                          <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                              {selectedViewMember.name}
                              {selectedViewMember.isPrimary && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">You</span>
                              )}
                            </h2>
                            <p className="text-gray-500 capitalize font-medium">{selectedViewMember.relationship} • {getAge(selectedViewMember.dateOfBirth)} years old</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Gender</p>
                            <p className="font-semibold text-gray-900 capitalize">{selectedViewMember.gender}</p>
                          </div>
                          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Blood Group</p>
                            <p className="font-semibold text-gray-900">{selectedViewMember.bloodGroup || '--'}</p>
                          </div>
                          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-gray-100 sm:col-span-2">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date of Birth</p>
                            <p className="font-semibold text-gray-900">{new Date(selectedViewMember.dateOfBirth).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Medical Details */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" /> Known Conditions</h4>
                            {selectedViewMember.knownConditions?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedViewMember.knownConditions.map((c, i) => (
                                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">{c}</span>
                                ))}
                              </div>
                            ) : <p className="text-sm text-gray-500">None reported</p>}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Allergies</h4>
                            {selectedViewMember.allergies?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedViewMember.allergies.map((a, i) => (
                                  <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">{a}</span>
                                ))}
                              </div>
                            ) : <p className="text-sm text-gray-500">None reported</p>}
                          </div>
                        </div>

                        <div className="bg-[#FAF8F5] rounded-xl p-6 border border-gray-100 text-center">
                          <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <h4 className="font-semibold text-gray-900 mb-1">Health Reports</h4>
                          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">Upload and manage prescriptions, test results, and scan reports for {selectedViewMember.name}.</p>
                          <Link href={`/health-records?member=${selectedViewMember._id}`} className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2e44] transition shadow-sm">
                            <FileUp className="w-4 h-4" /> Go to Health Records
                          </Link>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                           <button onClick={() => openEditModal(selectedViewMember)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition">
                             Edit Profile
                           </button>
                           {!selectedViewMember.isPrimary && (
                             <button onClick={() => { handleDelete(selectedViewMember._id); setSelectedViewMember(null); }} className="px-5 py-2.5 bg-red-50 text-red-600 font-medium text-sm rounded-lg hover:bg-red-100 transition flex items-center gap-2">
                               <Trash2 className="w-4 h-4" /> Remove
                             </button>
                           )}
                        </div>

                      </div>
                    </div>
                  </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map((m) => (
                      <div 
                        key={m._id} 
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedViewMember(m)}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#0D1B2A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" />
                              ) : (
                                <div className={`w-12 h-12 rounded-full ${getColorClass(m.avatarColor)} text-white flex items-center justify-center text-lg font-bold shadow-sm`}>
                                  {getInitials(m.name)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                                  {m.name}
                                  {m.isPrimary && (
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal uppercase">
                                      You
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs text-gray-500 capitalize">{m.relationship}</p>
                              </div>
                            </div>
                            
                            {!m.isPrimary && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(m); }}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Member Details */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-[#FAF8F5] rounded-xl p-2.5 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500 font-medium uppercase">Age</p>
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {(!m.isPrimary || !isProfileIncomplete(m)) ? `${getAge(m.dateOfBirth)} yrs` : '--'}
                                </p>
                              </div>
                            </div>
                            <div className="bg-[#FAF8F5] rounded-xl p-2.5 flex items-center gap-2">
                              <HeartPulse className="w-4 h-4 text-gray-400" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500 font-medium uppercase">Blood</p>
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {m.bloodGroup || '--'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isProfileIncomplete(m) && (
                          <div className="mt-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(m); }}
                              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                              <User className="w-3.5 h-3.5" /> Complete Your Profile
                            </button>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-4">
                          <span className="text-xs font-medium text-[#0D1B2A] group-hover:underline">View full details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                  </>
                )}
              </div>

              {/* Right Column: Family Meta & ABHA Info */}
              <div className="space-y-6">
                {/* Family details summary */}
                {familyDetails && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Family Group Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Group Name</span>
                        <span className="font-medium text-gray-900">{familyDetails.familyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plan type</span>
                        <span className="font-medium text-gray-900 capitalize">{familyDetails.plan}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Storage Used</span>
                          <span>{familyDetails.storageUsed} GB / {familyDetails.storageLimit} GB</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(familyDetails.storageUsed / familyDetails.storageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABHA card section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldPlus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Connect your ABHA ID</h3>
                      <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                        Auto-import health records from ABHA-linked hospitals, laboratories and clinics across India.
                      </p>
                      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
                        Connect ABHA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0D1B2A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-serif font-bold text-gray-900">Add Family Member</h3>
              <button 
                type="button"
                onClick={() => { setShowAddModal(false); setFormData(initialFormState); }} 
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-6">
              {FormFields}
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-[#0D1B2A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-serif font-bold text-gray-900">Edit Family Member</h3>
              <button 
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedMember(null); setFormData(initialFormState); }} 
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, true)} className="p-6">
              {FormFields}
            </form>
          </div>
        </div>
      )}

      {/* Create Family Modal */}
      {showCreateFamilyModal && (
        <div className="fixed inset-0 bg-[#0D1B2A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gray-900">Create Family Group</h3>
              <button
                type="button"
                onClick={() => setShowCreateFamilyModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Group Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Sharma Family"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-400 mt-1">Default: Your Name's Family</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCreateFamilyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFamily}
                disabled={creatingFamily}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0D1B2A] hover:bg-[#1a2e44] rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {creatingFamily && <Loader2 className="w-4 h-4 animate-spin" />}
                {creatingFamily ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}