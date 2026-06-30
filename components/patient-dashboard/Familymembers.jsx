'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CreditCard,
  ShieldCheck,
  Bell,
  Download,
  Pencil,
  Trash2,
  Plus,
  ShieldPlus,
  X,
  Loader2,
} from 'lucide-react';
import Sidebar from './Sidebar';

const settingsNav = [
  { key: 'family', label: 'Family Members', icon: Users },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'export', label: 'Data Export', icon: Download },
];

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
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  const m = new Date().getMonth() - new Date(dob).getMonth();
  return m < 0 || (m === 0 && new Date().getDate() < new Date(dob).getDate()) ? age - 1 : age;
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

export default function FamilyMembers() {
  const [activeTab, setActiveTab] = useState('family');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchFamilyMembers(); }, []);

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
        const membersRes = await fetch(`/api/family/members?familyId=${id}`);
        if (!membersRes.ok) throw new Error('Failed to fetch family members');
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      } else {
        // No family exists - show create family option
        setMembers([]);
        // Don't set error, just show empty state with create option
      }
    } catch (err) {
      console.error('Error fetching:', err);
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
        body: JSON.stringify({ familyName: familyName || 'My Family' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create family');

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

    // Validate required fields
    if (!formData.name || !formData.relationship || !formData.dateOfBirth || !formData.gender) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    // Validate familyId exists for add
    if (!isEdit && !familyId) {
      setError('No family found. Please create a family first.');
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
        relation: formData.emergencyContactRelation?.trim() || undefined,
      },
    };

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
    } catch (err) {
      console.error('Error submitting:', err);
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
    });
    setShowEditModal(true);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const FormFields = useMemo(() => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => updateFormData('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select 
              value={formData.bloodGroup} 
              onChange={(e) => updateFormData('bloodGroup', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">Select</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
            placeholder="Enter email address" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Known Conditions (comma separated)</label>
          <input 
            type="text" 
            value={formData.knownConditions} 
            onChange={(e) => updateFormData('knownConditions', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
            placeholder="e.g., Diabetes, Hypertension" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
          <input 
            type="text" 
            value={formData.allergies} 
            onChange={(e) => updateFormData('allergies', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
            placeholder="e.g., Penicillin, Peanuts" 
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                value={formData.emergencyContactName} 
                onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Contact name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                value={formData.emergencyContactPhone} 
                onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Phone number" 
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
            <input 
              type="text" 
              value={formData.emergencyContactRelation} 
              onChange={(e) => updateFormData('emergencyContactRelation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
              placeholder="e.g., Brother, Friend" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => { setShowAddModal(false); setShowEditModal(false); setFormData(initialFormState); }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    );
  }, [formData, submitting]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Sidebar />
      <main className="md:pl-[280px]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 pt-16 md:pt-10 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </main>
    </div>
  );

  // If no family exists, show create family UI
  if (!familyId && !loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Sidebar />
        <main className="md:pl-[280px]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 pt-16 md:pt-10">
            <header className="mb-8">
              <h1 className="text-4xl font-serif text-gray-900 tracking-tight">Settings</h1>
              <p className="text-gray-500 mt-1.5 text-[15px]">Manage your account and preferences</p>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-gray-900 mb-2">No Family Found</h2>
              <p className="text-gray-500 mb-6">You need to create a family before you can add members.</p>
              <button
                onClick={() => setShowCreateFamilyModal(true)}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Family
              </button>
            </div>
          </div>
        </main>

        {/* Create Family Modal */}
        {showCreateFamilyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif text-gray-900">Create Family</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateFamilyModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">Default: Your Name's Family</p>
              </div>
              <div className="flex justify-end gap-3">
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
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {creatingFamily && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creatingFamily ? 'Creating...' : 'Create Family'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Sidebar />
      <main className="md:pl-[280px]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 pt-16 md:pt-10">
          <header className="mb-8">
            <h1 className="text-4xl font-serif text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-1.5 text-[15px]">Manage your account and preferences</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <ul className="space-y-1">
                {settingsNav.map((item) => (
                  <li key={item.key}>
                    <button onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <item.icon className={`w-[18px] h-[18px] ${activeTab === item.key ? 'text-white' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-6">
              {activeTab === 'family' ? (
                <>
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-gray-900">Family Members</h2>
                      <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                        <Plus className="w-4 h-4" /> Add member
                      </button>
                    </div>

                    {members.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No family members yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first family member</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {members.map((m) => (
                          <li key={m._id} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-full ${getColorClass(m.avatarColor)} text-white flex items-center justify-center text-base font-medium shrink-0`}>
                                {getInitials(m.name)}
                              </div>
                              <div>
                                <p className="text-[15px] font-medium text-gray-900">
                                  {m.name}{m.isPrimary && <span className="text-gray-400 font-normal"> (You)</span>}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {getAge(m.dateOfBirth)} years · {m.relationship.charAt(0).toUpperCase() + m.relationship.slice(1)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => openEditModal(m)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                                <Pencil className="w-4 h-4" />
                              </button>
                              {!m.isPrimary && (
                                <button onClick={() => handleDelete(m._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                        <ShieldPlus className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-gray-900">Connect your ABHA ID</h3>
                        <p className="text-gray-500 text-[15px] mt-1.5 leading-relaxed">
                          Auto-import health records from ABHA-linked hospitals · Verified health identity · Seamless insurance claims
                        </p>
                        <button className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                          Connect ABHA <span aria-hidden>↗</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
                  {settingsNav.find(n => n.key === activeTab)?.label} settings coming soon.
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-serif text-gray-900">Add Family Member</h3>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-serif text-gray-900">Edit Family Member</h3>
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
    </div>
  );
}