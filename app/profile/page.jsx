// app/patient/profile/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  Save,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Home,
  Building,
  Navigation,
  Globe,
  Shield,
  UserCircle,
} from 'lucide-react';
import Sidebar from '@/components/patient-dashboard/Sidebar';
import toast, { Toaster } from 'react-hot-toast';

// Toast helpers
const T = {
  success: (msg) => toast.custom(t => (
    <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl flex border border-emerald-100`}>
      <div className="flex-1 p-4 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /><p className="text-sm font-bold text-gray-900">{msg}</p></div>
      <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-400 hover:text-gray-500 border-l border-gray-100"><X className="w-5 h-5" /></button>
    </div>
  ), { duration: 3000 }),
  error: (msg) => toast.custom(t => (
    <div className={`${t.visible?'animate-enter':'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl flex border border-rose-100`}>
      <div className="flex-1 p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" /><p className="text-sm font-bold text-gray-900">{msg}</p></div>
      <button onClick={() => toast.dismiss(t.id)} className="p-4 text-gray-400 hover:text-gray-500 border-l border-gray-100"><X className="w-5 h-5" /></button>
    </div>
  ), { duration: 4000 }),
};

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    address: {
      street: '',
      area: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    profile: {
      dateOfBirth: '',
      gender: 'other',
      bloodGroup: '',
      avatarColor: '#6B7280',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        T.error('Please login to continue');
        return;
      }
      if (res.status === 403) {
        T.error('Access denied');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch profile');
      
      const data = await res.json();
      setUser(data.user);
      setFormData({
        fullName: data.user.fullName || '',
        mobile: data.user.mobile || '',
        email: data.user.email || '',
        address: {
          street: data.user.address?.street || '',
          area: data.user.address?.area || '',
          landmark: data.user.address?.landmark || '',
          city: data.user.address?.city || '',
          district: data.user.address?.district || '',
          state: data.user.address?.state || '',
          pincode: data.user.address?.pincode || '',
          country: data.user.address?.country || 'India',
        },
        profile: {
          dateOfBirth: data.user.profile?.dateOfBirth?.split('T')[0] || '',
          gender: data.user.profile?.gender || 'other',
          bloodGroup: data.user.profile?.bloodGroup || '',
          avatarColor: data.user.profile?.avatarColor || '#6B7280',
        },
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      T.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'address') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (section === 'profile') {
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        T.error('Please login to continue');
        return;
      }
      if (res.status === 403) {
        T.error('Access denied');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      T.success('Profile updated successfully!');
      setUser(data.user);
    } catch (err) {
      console.error('Error updating profile:', err);
      T.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Sidebar />
        <main className="md:pl-[280px]">
          <div className="max-w-4xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10 flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
            <p className="text-gray-500 font-medium">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Toaster position="top-right" />
      <Sidebar />
      
      <main className="md:pl-[280px]">
        <div className="max-w-4xl mx-auto px-4 md:px-10 py-10 pt-16 md:pt-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E40AF] text-xs font-bold rounded-full tracking-wider uppercase">
                <UserCircle className="w-3.5 h-3.5" />
                My Profile
              </span>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mt-3 tracking-tight">
                Personal Information
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                View and manage your personal details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1.5 rounded-full border shadow-sm ${
                user?.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {user?.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Personal Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('', 'fullName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('', 'mobile', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('', 'email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Address Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-gray-400" /> Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="House number, building name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-gray-400" /> Area / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.address.area}
                    onChange={(e) => handleInputChange('address', 'area', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="Area or locality name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-gray-400" /> Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.address.landmark}
                    onChange={(e) => handleInputChange('address', 'landmark', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="Nearby landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address', 'district', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="District"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="Pincode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gray-400" /> Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Full address preview */}
              {user?.fullAddress && (
                <div className="mt-4 p-3 bg-[#FAF8F5] rounded-lg border border-gray-100 text-sm">
                  <span className="text-gray-500">Full Address: </span>
                  <span className="text-gray-900">{user.fullAddress}</span>
                </div>
              )}
            </section>

            {/* Medical Profile */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-serif font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-gray-400" />
                Medical Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.profile.dateOfBirth}
                    onChange={(e) => handleInputChange('profile', 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select
                    value={formData.profile.gender}
                    onChange={(e) => handleInputChange('profile', 'gender', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <select
                    value={formData.profile.bloodGroup}
                    onChange={(e) => handleInputChange('profile', 'bloodGroup', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => fetchProfile()}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}