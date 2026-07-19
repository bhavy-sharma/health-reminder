// app/doctor/(protected)/profile/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bell, Eye, Save, Camera, MapPin, CheckCircle2, Plus, X, Trash2, Star, Loader2, AlertCircle, Home, Building, Navigation, Globe, Clock } from "lucide-react";

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    fullName: "",
    specialty: "",
    tagline: "",
    experience: "",
    regNo: "",
    inPersonFee: "",
    videoFee: "",
    bio: "",
    hospital: "",
    address: {
      street: "",
      area: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      country: "India",
    },
    city: "",
  });

  // Multi-select states
  const [languages, setLanguages] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [education, setEducation] = useState([]);
  const [awards, setAwards] = useState([]);
  const [slots, setSlots] = useState([]);

  // Slot form state
  const [slotTime, setSlotTime] = useState("09:00");
  const [slotAmPm, setSlotAmPm] = useState("AM");

  // Input states for adding items
  const [newLang, setNewLang] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newAward, setNewAward] = useState("");

  // All available conditions
  const allConditions = useMemo(() => [
    'Heart Disease', 'Hypertension', 'Chest Pain', 'Arrhythmia', 'Coronary Artery Disease', 'Diabetes',
    'Thyroid', 'Obesity', 'Stroke', 'Migraine', 'Epilepsy', 'Knee Pain', 'Hip Replacement', 'Sports Injury',
    'Cataract', 'Glaucoma', 'Diabetic Retinopathy'
  ], []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/doctor/profile');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      if (result.success) {
        const data = result.data;
        setProfile({
          fullName: data.fullName || data.name || '',
          specialty: data.specialty || '',
          tagline: data.tagline || '',
          experience: data.experience || '',
          regNo: data.regNo || data.medicalRegNo || '',
          inPersonFee: data.inPersonFee || data.consultationFee || '',
          videoFee: data.videoFee || data.videoConsultFee || '',
          bio: data.bio || data.about || '',
          hospital: data.hospital || '',
          address: {
            street: data.address?.street || '',
            area: data.address?.area || '',
            landmark: data.address?.landmark || '',
            city: data.address?.city || data.city || '',
            district: data.address?.district || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
            country: data.address?.country || 'India',
          },
          city: data.city || '',
        });
        setLanguages(data.languages || []);
        setSelectedConditions(data.conditions || []);
        setEducation(data.education || []);
        setAwards(data.awards || []);
        setSlots(data.slots || data.appointmentSlots || []);
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        fullName: profile.fullName,
        specialty: profile.specialty,
        tagline: profile.tagline,
        experience: parseInt(profile.experience) || 0,
        regNo: profile.regNo,
        inPersonFee: parseInt(profile.inPersonFee) || 0,
        videoFee: parseInt(profile.videoFee) || 0,
        bio: profile.bio,
        hospital: profile.hospital,
        address: {
          street: profile.address.street || '',
          area: profile.address.area || '',
          landmark: profile.address.landmark || '',
          city: profile.address.city || '',
          district: profile.address.district || '',
          state: profile.address.state || '',
          pincode: profile.address.pincode || '',
          country: profile.address.country || 'India',
        },
        city: profile.address.city || profile.city || '',
        languages: languages,
        conditions: selectedConditions,
        education: education,
        awards: awards,
        slots: slots,
      };

      console.log('📤 Saving payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile');
      }

      if (result.success) {
        if (result.data) {
          const data = result.data;
          setProfile({
            fullName: data.fullName || data.name || '',
            specialty: data.specialty || '',
            tagline: data.tagline || '',
            experience: data.experience || '',
            regNo: data.regNo || data.medicalRegNo || '',
            inPersonFee: data.inPersonFee || data.consultationFee || '',
            videoFee: data.videoFee || data.videoConsultFee || '',
            bio: data.bio || data.about || '',
            hospital: data.hospital || '',
            address: {
              street: data.address?.street || '',
              area: data.address?.area || '',
              landmark: data.address?.landmark || '',
              city: data.address?.city || data.city || '',
              district: data.address?.district || '',
              state: data.address?.state || '',
              pincode: data.address?.pincode || '',
              country: data.address?.country || 'India',
            },
            city: data.city || '',
          });
          setLanguages(data.languages || []);
          setSelectedConditions(data.conditions || []);
          setEducation(data.education || []);
          setAwards(data.awards || []);
          setSlots(data.slots || data.appointmentSlots || []);
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddressChange = useCallback((field, value) => {
    setProfile(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  }, []);

  const toggleCondition = useCallback((condition) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  }, []);

  const addLanguage = useCallback(() => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  }, [newLang, languages]);

  const removeLanguage = useCallback((langToRemove) => {
    setLanguages(languages.filter(l => l !== langToRemove));
  }, [languages]);

  const addEducation = useCallback(() => {
    if (newEdu.trim()) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu("");
    }
  }, [newEdu, education]);

  const removeEducation = useCallback((indexToRemove) => {
    setEducation(education.filter((_, idx) => idx !== indexToRemove));
  }, [education]);

  const addAward = useCallback(() => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward("");
    }
  }, [newAward, awards]);

  const removeAward = useCallback((indexToRemove) => {
    setAwards(awards.filter((_, idx) => idx !== indexToRemove));
  }, [awards]);

  // ─── Updated Slot functions ───
  const addSlot = useCallback(() => {
    // Validate time format (should be HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(slotTime)) {
      alert('Please enter a valid time in HH:MM format (e.g., 09:00)');
      return;
    }

    // Format the slot string properly
    const formattedSlot = `${slotTime} ${slotAmPm}`;
    
    if (!slots.includes(formattedSlot)) {
      setSlots([...slots, formattedSlot]);
      // Reset to default values
      setSlotTime("09:00");
      setSlotAmPm("AM");
    }
  }, [slotTime, slotAmPm, slots]);

  const removeSlot = useCallback((slotToRemove) => {
    setSlots(slots.filter(s => s !== slotToRemove));
  }, [slots]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
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
              Your profile is currently under verification. Profile editing is temporarily unavailable until verification is complete.
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">Edit Profile</span>
        </div>
      </div>

      {!isPreview ? (
        <>
          {/* Edit View Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-1">Edit Profile</h1>
              <p className="text-gray-400">Changes go live after saving</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                <Eye size={18} /> Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Save size={18} />}
                {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-red-500 text-white flex items-center justify-center text-3xl font-serif font-bold">
                {profile.fullName?.split(' ').map(n => n[0]).join('') || 'D'}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Specialty</label>
                  <select
                    name="specialty"
                    value={profile.specialty}
                    onChange={handleChange}
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm appearance-none"
                  >
                    <option value="">Select Specialty</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Diabetologist">Diabetologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Urologist">Urologist</option>
                    <option value="Oncologist">Oncologist</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Display Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={profile.tagline}
                    onChange={handleChange}
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Medical Reg. No.</label>
                  <input
                    type="text"
                    name="regNo"
                    value={profile.regNo}
                    onChange={handleChange}
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Fees */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Consultation Fees</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">In-Person Fee (₹)</label>
                <input
                  type="number"
                  name="inPersonFee"
                  value={profile.inPersonFee}
                  onChange={handleChange}
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Video Consult Fee (₹)</label>
                <input
                  type="number"
                  name="videoFee"
                  value={profile.videoFee}
                  onChange={handleChange}
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">About / Bio</h2>
            <div>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full bg-gray-50/50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 text-sm resize-none h-32 leading-relaxed"
              />
              <div className="text-right text-xs font-medium text-gray-400 mt-2">
                {profile.bio?.length || 0} / 600 chars
              </div>
            </div>
          </div>

          {/* Practice Location */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Practice Location
            </h2>
            <div className="space-y-6">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hospital / Clinic Name</label>
                <input
                  type="text"
                  name="hospital"
                  value={profile.hospital}
                  onChange={handleChange}
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Street Address</label>
                  <input
                    type="text"
                    value={profile.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="House number, building name"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Area / Locality</label>
                  <input
                    type="text"
                    value={profile.address.area}
                    onChange={(e) => handleAddressChange('area', e.target.value)}
                    placeholder="Area or locality name"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Landmark</label>
                <input
                  type="text"
                  value={profile.address.landmark}
                  onChange={(e) => handleAddressChange('landmark', e.target.value)}
                  placeholder="Nearby landmark"
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    value={profile.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">District</label>
                  <input
                    type="text"
                    value={profile.address.district}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                    placeholder="District"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    value={profile.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pincode</label>
                  <input
                    type="text"
                    value={profile.address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                <input
                  type="text"
                  value={profile.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="Country"
                  className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
                />
              </div>

              {(profile.address.street || profile.address.area || profile.address.city) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                  <span className="text-gray-500">Full Address: </span>
                  <span className="text-gray-900">
                    {[
                      profile.address.street,
                      profile.address.area,
                      profile.address.landmark,
                      profile.address.city,
                      profile.address.district,
                      profile.address.state,
                      profile.address.pincode,
                      profile.address.country
                    ].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Conditions Treated */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Conditions Treated</h2>
            <p className="text-xs text-gray-400 mb-6 font-medium">Select all that apply</p>
            <div className="flex flex-wrap gap-2.5">
              {allConditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedConditions.includes(condition)
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-50/50 text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Languages Spoken</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {languages.map(lang => (
                <div key={lang} className="bg-emerald-50 text-emerald-600 font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                  {lang}
                  <button onClick={() => removeLanguage(lang)} className="hover:text-gray-900">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                placeholder="Add language..."
                className="flex-1 bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
              />
              <button
                onClick={addLanguage}
                className="bg-gray-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-800 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Education & Training */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-center gap-2 text-emerald-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a2 2 0 0 1-.019 3.022l-7.1 7.1a2 2 0 0 1-2.79.074l-.02-.018-7.1-7.1a2 2 0 0 1-.018-3.022l7.1-7.1a2 2 0 0 1 2.79-.074l.02.018 7.1 7.1Z" /><path d="m7.5 13.5-4 3 4 3" /><path d="m16.5 13.5 4 3-4 3" /></svg>
              <h2 className="text-xl font-bold text-gray-900">Education & Training</h2>
            </div>

            <div className="space-y-3 mb-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-gray-50/30 rounded-xl py-3 px-4 flex items-center justify-between group">
                  <span className="text-sm font-medium text-gray-600">{edu}</span>
                  <button onClick={() => removeEducation(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newEdu}
                onChange={(e) => setNewEdu(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEducation()}
                placeholder="Degree – Institution Name (Year)..."
                className="flex-1 bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
              />
              <button
                onClick={addEducation}
                className="bg-gray-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-800 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Awards & Recognition */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-center gap-2 text-amber-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
              <h2 className="text-xl font-bold text-gray-900">Awards & Recognition</h2>
            </div>

            <div className="space-y-3 mb-4">
              {awards.map((award, idx) => (
                <div key={idx} className="bg-gray-50/30 rounded-xl py-3 px-4 flex items-center gap-3 group">
                  <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-600 flex-1">{award}</span>
                  <button onClick={() => removeAward(idx)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAward()}
                placeholder="Award name – Year..."
                className="flex-1 bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
              />
              <button
                onClick={addAward}
                className="bg-gray-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-800 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* ─── Updated Appointment Slots Section ─── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock size={18} />
              <h2 className="text-xl font-bold text-gray-900">Appointment Slots</h2>
            </div>
            <p className="text-xs text-gray-400 mb-6 font-medium">Time slots shown to patients when booking</p>

            {/* Display existing slots */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {slots.map((slot, index) => (
                <div key={index} className="bg-gray-900 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  {slot}
                  <button onClick={() => removeSlot(slot)} className="text-white/60 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {slots.length === 0 && (
                <p className="text-sm text-gray-400 italic">No slots added yet.</p>
              )}
            </div>

            {/* Add slot form */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Time</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    placeholder="09:00"
                    className="flex-1 bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
                  />
                  <select
                    value={slotAmPm}
                    onChange={(e) => setSlotAmPm(e.target.value)}
                    className="bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Format: HH:MM (e.g., 09:00, 14:30)</p>
              </div>
              <button
                onClick={addSlot}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 shrink-0 transition-colors"
              >
                <Plus size={20} />
                Add Slot
              </button>
            </div>
          </div>

          {/* Big Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gray-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-gray-800 transition-opacity shadow-md disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
            ) : isSaved ? (
              <><CheckCircle2 size={22} className="text-emerald-400" /> Profile Saved!</>
            ) : (
              <><Save size={22} /> Save All Changes</>
            )}
          </button>
        </>
      ) : (
        // Preview mode
        <>
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-1">Profile Preview</h1>
              <p className="text-gray-400">This is how patients see your profile on Find Doctors.</p>
            </div>
            <button
              onClick={() => setIsPreview(false)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              ← Back to Edit
            </button>
          </div>

          <div className="max-w-3xl">
            {/* Top Identity Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <div className="w-28 h-28 rounded-[2rem] bg-red-500 text-white flex items-center justify-center text-4xl font-serif font-bold shrink-0">
                  {profile.fullName?.split(' ').map(n => n[0]).join('') || 'D'}
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                    {profile.fullName}
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </h2>
                  <p className="text-gray-600 font-medium text-lg mb-2">{profile.tagline}</p>
                  <p className="text-gray-400 flex items-center gap-1.5 text-sm mb-4">
                    <MapPin size={16} /> {profile.hospital}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold">
                      {profile.experience} yrs exp
                    </span>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold">
                      ₹{profile.inPersonFee} / visit
                    </span>
                    <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold">
                      Video ₹{profile.videoFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {profile.bio}
              </p>
            </div>

            {/* Practice Location Preview */}
            {(profile.address.city || profile.address.state) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Practice Location
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {[
                    profile.address.street,
                    profile.address.area,
                    profile.address.landmark,
                    profile.address.city,
                    profile.address.district,
                    profile.address.state,
                    profile.address.pincode,
                    profile.address.country
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Conditions Treated */}
            {selectedConditions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Conditions Treated</h3>
                <div className="flex flex-wrap gap-2.5">
                  {selectedConditions.map(condition => (
                    <span key={condition} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Education</h3>
                <ul className="space-y-3">
                  {education.map((edu, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-emerald-500 mt-1 text-[10px]">●</span>
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Awards</h3>
                <ul className="space-y-3">
                  {awards.map((award, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-amber-400 mt-1">★</span>
                      {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <span key={lang} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Slots Preview */}
            {slots.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Available Appointment Slots</h3>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, index) => (
                    <span key={index} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}