// app/doctor/(protected)/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Eye, Save, Camera, MapPin, CheckCircle2, Plus, X, Trash2, Star, Loader2, AlertCircle } from "lucide-react";

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
    address: "",
    city: "",
  });

  // Multi-select states
  const [languages, setLanguages] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [education, setEducation] = useState([]);
  const [awards, setAwards] = useState([]);
  const [slots, setSlots] = useState([]);

  // Input states for adding items
  const [newLang, setNewLang] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newAward, setNewAward] = useState("");
  const [newSlot, setNewSlot] = useState("");

  // All available conditions
  const allConditions = [
    'Heart Disease', 'Hypertension', 'Chest Pain', 'Arrhythmia', 'Coronary Artery Disease', 'Diabetes',
    'Thyroid', 'Obesity', 'Stroke', 'Migraine', 'Epilepsy', 'Knee Pain', 'Hip Replacement', 'Sports Injury',
    'Cataract', 'Glaucoma', 'Diabetic Retinopathy'
  ];

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
          fullName: data.fullName || '',
          specialty: data.specialty || '',
          tagline: data.tagline || '',
          experience: data.experience || '',
          regNo: data.regNo || '',
          inPersonFee: data.inPersonFee || '',
          videoFee: data.videoFee || '',
          bio: data.bio || '',
          hospital: data.hospital || '',
          address: data.address || '',
          city: data.city || '',
        });
        setLanguages(data.languages || []);
        setSelectedConditions(data.conditions || []);
        setEducation(data.education || []);
        setAwards(data.awards || []);
        setSlots(data.slots || []);
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
        ...profile,
        languages,
        conditions: selectedConditions,
        education,
        awards,
        slots,
      };

      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile');
      }

      if (result.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const toggleCondition = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    } else {
      setSelectedConditions(prev => [...prev, condition]);
    }
  };

  const addLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  };

  const removeLanguage = (langToRemove) => {
    setLanguages(languages.filter(l => l !== langToRemove));
  };

  const addEducation = () => {
    if (newEdu.trim()) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu("");
    }
  };

  const removeEducation = (indexToRemove) => {
    setEducation(education.filter((_, idx) => idx !== indexToRemove));
  };

  const addAward = () => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward("");
    }
  };

  const removeAward = (indexToRemove) => {
    setAwards(awards.filter((_, idx) => idx !== indexToRemove));
  };

  const addSlot = () => {
    if (newSlot.trim() && !slots.includes(newSlot.trim())) {
      setSlots([...slots, newSlot.trim()]);
      setNewSlot("");
    }
  };

  const removeSlot = (slotToRemove) => {
    setSlots(slots.filter(s => s !== slotToRemove));
  };

  const InputField = ({ label, name, type = "text", ...props }) => (
    <div className="flex-1">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={handleChange}
        className="w-full bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 font-medium text-sm"
        {...props}
      />
    </div>
  );

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
        <button className="relative p-2 text-gray-700 hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
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

          {/* Rest of the form - keep the same but use state values */}
          {/* ... (all the form sections remain the same, just use the state values) */}
          
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
              <InputField label="Full Name" name="fullName" />
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
                <InputField label="Display Tagline" name="tagline" />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <InputField label="Experience (Years)" name="experience" type="number" />
                <InputField label="Medical Reg. No." name="regNo" />
              </div>
            </div>
          </div>

          {/* Consultation Fees */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Consultation Fees</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <InputField label="In-Person Fee (₹)" name="inPersonFee" type="number" />
              <InputField label="Video Consult Fee (₹)" name="videoFee" type="number" />
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
              ></textarea>
              <div className="text-right text-xs font-medium text-gray-400 mt-2">
                {profile.bio?.length || 0} / 600 chars
              </div>
            </div>
          </div>

          {/* Practice Location */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Practice Location</h2>
            <div className="space-y-6">
              <InputField label="Hospital / Clinic Name" name="hospital" />
              <InputField label="Full Address" name="address" />
            </div>
          </div>

          {/* Conditions Treated - keep the same */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Conditions Treated</h2>
            <p className="text-xs text-gray-400 mb-6 font-medium">Select all that apply</p>
            <div className="flex flex-wrap gap-2.5">
              {allConditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedConditions.includes(condition)
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a2 2 0 0 1-.019 3.022l-7.1 7.1a2 2 0 0 1-2.79.074l-.02-.018-7.1-7.1a2 2 0 0 1-.018-3.022l7.1-7.1a2 2 0 0 1 2.79-.074l.02.018 7.1 7.1Z"/><path d="m7.5 13.5-4 3 4 3"/><path d="m16.5 13.5 4 3-4 3"/></svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
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

          {/* Appointment Slots */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h2 className="text-xl font-bold text-gray-900">Appointment Slots</h2>
            </div>
            <p className="text-xs text-gray-400 mb-6 font-medium">Time slots shown to patients when booking</p>
            
            <div className="flex flex-wrap gap-2.5 mb-4">
              {slots.map(slot => (
                <div key={slot} className="bg-gray-900 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  {slot} 
                  <button onClick={() => removeSlot(slot)} className="text-white/60 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSlot()}
                placeholder="e.g. 9:00 AM"
                className="flex-1 bg-gray-50/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm"
              />
              <button 
                onClick={addSlot}
                className="bg-gray-900 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-800 shrink-0"
              >
                <Plus size={20} />
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
        // Preview mode - keep the same
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
          </div>
        </>
      )}
    </div>
  );
}