"use client";

import { useState } from "react";
import { Bell, Eye, Save, Camera, MapPin, CheckCircle2, Plus, X, Trash2, Star } from "lucide-react";

export default function DoctorProfile() {
  const [isPreview, setIsPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Profile State
  const [profile, setProfile] = useState({
    fullName: "Dr. Priya Mehta",
    specialty: "Cardiologist",
    tagline: "Cardiologist & Interventional",
    experience: "18",
    regNo: "MCI-DL-2007-43281",
    inPersonFee: "800",
    videoFee: "700",
    bio: "Dr. Priya Mehta is a senior interventional cardiologist with 18 years of experience at Apollo Hospitals. She completed her DM Cardiology from AIIMS Delhi and has performed over 2000 angioplasties.",
    hospital: "Apollo Hospitals, Bandra",
    address: "Plot 1-A, Marathe Marg, Bandra Reclamation, Mumbai - 400 050",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Conditions State
  const allConditions = [
    'Heart Disease', 'Hypertension', 'Chest Pain', 'Arrhythmia', 'Coronary Artery Disease', 'Diabetes',
    'Thyroid', 'Obesity', 'Stroke', 'Migraine', 'Epilepsy', 'Knee Pain', 'Hip Replacement', 'Sports Injury',
    'Cataract', 'Glaucoma', 'Diabetic Retinopathy'
  ];
  const [selectedConditions, setSelectedConditions] = useState(['Heart Disease', 'Chest Pain', 'Arrhythmia', 'Coronary Artery Disease']);

  const toggleCondition = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    } else {
      setSelectedConditions(prev => [...prev, condition]);
    }
  };

  // Languages State
  const [languages, setLanguages] = useState(['Hindi', 'English', 'Marathi']);
  const [newLang, setNewLang] = useState("");
  const addLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  };
  const removeLanguage = (langToRemove) => {
    setLanguages(languages.filter(l => l !== langToRemove));
  };

  // Education State
  const [education, setEducation] = useState([
    "MBBS - Grant Medical College, Mumbai (2000)",
    "MD Internal Medicine - KEM Hospital, Mumbai (2004)"
  ]);
  const [newEdu, setNewEdu] = useState("");
  const addEducation = () => {
    if (newEdu.trim()) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu("");
    }
  };
  const removeEducation = (indexToRemove) => {
    setEducation(education.filter((_, idx) => idx !== indexToRemove));
  };

  // Awards State
  const [awards, setAwards] = useState([
    "Best Cardiologist Award - Apollo, 2022",
    "Featured in Forbes India Healthcare 40 Under 40"
  ]);
  const [newAward, setNewAward] = useState("");
  const addAward = () => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward("");
    }
  };
  const removeAward = (indexToRemove) => {
    setAwards(awards.filter((_, idx) => idx !== indexToRemove));
  };

  // Slots State
  const [slots, setSlots] = useState(['10:00 AM', '10:30 AM', '4:30 PM', '5:00 PM', '5:30 PM']);
  const [newSlot, setNewSlot] = useState("");
  const addSlot = () => {
    if (newSlot.trim() && !slots.includes(newSlot.trim())) {
      setSlots([...slots, newSlot.trim()]);
      setNewSlot("");
    }
  };
  const removeSlot = (slotToRemove) => {
    setSlots(slots.filter(s => s !== slotToRemove));
  };

  // Reusable Input Field Component
  const InputField = ({ label, name, type = "text", ...props }) => (
    <div className="flex-1">
      <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={handleChange}
        className="w-full bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] transition-shadow text-[var(--color-navy)] font-medium text-sm"
        {...props}
      />
    </div>
  );

  return (
    <div className="p-8 pb-24 h-screen overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-[var(--color-navy)] font-bold">Edit Profile</span>
        </div>
        <button className="relative p-2 text-[var(--color-navy)] hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-pulse-red)] rounded-full border-2 border-[var(--color-cream)]"></span>
        </button>
      </div>

      {!isPreview ? (
        <>
          {/* Edit View Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-1">Edit Profile</h1>
              <p className="text-[var(--color-text-muted)]">Changes go live after saving</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 bg-[#efebe4] text-[var(--color-navy)] px-5 py-2.5 rounded-xl font-bold hover:bg-[#e2ddd5] transition-colors"
              >
                <Eye size={18} /> Preview
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-[var(--color-navy)] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-opacity"
              >
                {isSaved ? <CheckCircle2 size={18} className="text-[#4a9e7f]" /> : <Save size={18} />} 
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-[#e8403a] text-white flex items-center justify-center text-3xl font-fraunces font-bold">
                PM
              </div>
              <div>
                <button className="flex items-center gap-2 bg-[#efebe4] text-[var(--color-navy)] font-bold px-4 py-2.5 rounded-xl hover:bg-[#e2ddd5] transition-colors text-sm">
                  <Camera size={18} /> Upload Photo
                </button>
                <p className="text-xs text-[var(--color-text-muted)] mt-2 font-medium">JPG or PNG · max 2 MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Basic Information</h2>
            <div className="space-y-6">
              <InputField label="Full Name" name="fullName" />
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Specialty</label>
                  <select 
                    name="specialty" 
                    value={profile.specialty}
                    onChange={handleChange}
                    className="w-full bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] transition-shadow text-[var(--color-navy)] font-medium text-sm appearance-none"
                  >
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
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Consultation Fees</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <InputField label="In-Person Fee (₹)" name="inPersonFee" type="number" />
              <InputField label="Video Consult Fee (₹)" name="videoFee" type="number" />
            </div>
          </div>

          {/* About / Bio */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">About / Bio</h2>
            <div>
              <textarea 
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full bg-[#efebe4]/50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] transition-shadow text-[var(--color-navy)] text-sm resize-none h-32 leading-relaxed"
              ></textarea>
              <div className="text-right text-xs font-medium text-[var(--color-text-muted)] mt-2">
                {profile.bio.length} / 600 chars
              </div>
            </div>
          </div>

          {/* Practice Location */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Practice Location</h2>
            <div className="space-y-6">
              <InputField label="Hospital / Clinic Name" name="hospital" />
              <InputField label="Full Address" name="address" />
            </div>
          </div>

          {/* Conditions Treated */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-1">Conditions Treated</h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-6 font-medium">Select all that apply</p>
            <div className="flex flex-wrap gap-2.5">
              {allConditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedConditions.includes(condition)
                      ? 'bg-[var(--color-navy)] text-white shadow-md'
                      : 'bg-[#efebe4]/50 text-[var(--color-text-muted)] hover:bg-[#efebe4]'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Languages Spoken</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {languages.map(lang => (
                <div key={lang} className="bg-[#e6f4ef] text-[#4a9e7f] font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                  {lang} 
                  <button onClick={() => removeLanguage(lang)} className="hover:text-[var(--color-navy)]">
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
                className="flex-1 bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] text-[var(--color-navy)] text-sm"
              />
              <button 
                onClick={addLanguage}
                className="bg-[var(--color-navy)] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-opacity-90 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Education & Training */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <div className="flex items-center gap-2 text-[var(--color-sage-green)] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap"><path d="M21.42 10.922a2 2 0 0 1-.019 3.022l-7.1 7.1a2 2 0 0 1-2.79.074l-.02-.018-7.1-7.1a2 2 0 0 1-.018-3.022l7.1-7.1a2 2 0 0 1 2.79-.074l.02.018 7.1 7.1Z"/><path d="m7.5 13.5-4 3 4 3"/><path d="m16.5 13.5 4 3-4 3"/></svg>
              <h2 className="text-xl font-bold text-[var(--color-navy)]">Education & Training</h2>
            </div>
            
            <div className="space-y-3 mb-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-[#efebe4]/30 rounded-xl py-3 px-4 flex items-center justify-between group">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">{edu}</span>
                  <button onClick={() => removeEducation(idx)} className="text-[var(--color-border)] hover:text-[#e8403a] transition-colors">
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
                className="flex-1 bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] text-[var(--color-navy)] text-sm"
              />
              <button 
                onClick={addEducation}
                className="bg-[var(--color-navy)] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-opacity-90 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Awards & Recognition */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
            <div className="flex items-center gap-2 text-[var(--color-warm-amber)] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              <h2 className="text-xl font-bold text-[var(--color-navy)]">Awards & Recognition</h2>
            </div>
            
            <div className="space-y-3 mb-4">
              {awards.map((award, idx) => (
                <div key={idx} className="bg-[#efebe4]/30 rounded-xl py-3 px-4 flex items-center gap-3 group">
                  <Star size={14} className="text-[var(--color-warm-amber)] fill-[var(--color-warm-amber)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-text-secondary)] flex-1">{award}</span>
                  <button onClick={() => removeAward(idx)} className="text-[var(--color-border)] hover:text-[#e8403a] transition-colors opacity-0 group-hover:opacity-100">
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
                className="flex-1 bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] text-[var(--color-navy)] text-sm"
              />
              <button 
                onClick={addAward}
                className="bg-[var(--color-navy)] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-opacity-90 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Appointment Slots */}
          <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-8">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h2 className="text-xl font-bold text-[var(--color-navy)]">Appointment Slots</h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-6 font-medium">Time slots shown to patients when booking</p>
            
            <div className="flex flex-wrap gap-2.5 mb-4">
              {slots.map(slot => (
                <div key={slot} className="bg-[var(--color-navy)] text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2">
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
                className="flex-1 bg-[#efebe4]/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--color-navy)] text-[var(--color-navy)] text-sm"
              />
              <button 
                onClick={addSlot}
                className="bg-[var(--color-navy)] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-opacity-90 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Big Save Button */}
          <button 
            onClick={handleSave}
            className="w-full bg-[var(--color-navy)] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-opacity-90 transition-opacity shadow-md"
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={22} className="text-[#4a9e7f]" /> Profile Saved!
              </>
            ) : (
              <>
                <Save size={22} /> Save All Changes
              </>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-1">Profile Preview</h1>
              <p className="text-[var(--color-text-muted)]">This is how patients see your profile on Find Doctors.</p>
            </div>
            <button 
              onClick={() => setIsPreview(false)}
              className="flex items-center gap-2 bg-[#efebe4] text-[var(--color-navy)] px-5 py-2.5 rounded-xl font-bold hover:bg-[#e2ddd5] transition-colors"
            >
              ← Back to Edit
            </button>
          </div>

          {/* Preview Layout */}
          <div className="max-w-3xl">
            {/* Top Identity Card */}
            <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <div className="w-28 h-28 rounded-[2rem] bg-[#e8403a] text-white flex items-center justify-center text-4xl font-fraunces font-bold shrink-0">
                  PM
                </div>
                <div>
                  <h2 className="font-fraunces text-3xl font-bold text-[var(--color-navy)] flex items-center gap-2 mb-1">
                    {profile.fullName}
                    <CheckCircle2 size={24} className="text-[#4a9e7f]" />
                  </h2>
                  <p className="text-[var(--color-text-secondary)] font-medium text-lg mb-2">{profile.tagline}</p>
                  <p className="text-[var(--color-text-muted)] flex items-center gap-1.5 text-sm mb-4">
                    <MapPin size={16} /> {profile.hospital}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-[#efebe4] text-[var(--color-navy)] px-3 py-1.5 rounded-full text-xs font-bold">
                      {profile.experience} yrs exp
                    </span>
                    <span className="bg-[#e6f4ef] text-[#4a9e7f] px-3 py-1.5 rounded-full text-xs font-bold">
                      ₹{profile.inPersonFee} / visit
                    </span>
                    <span className="bg-[#efebe4] text-[var(--color-text-secondary)] px-3 py-1.5 rounded-full text-xs font-bold">
                      Video ₹{profile.videoFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
              <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4">About</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
                {profile.bio}
              </p>
            </div>

            {/* Conditions Treated */}
            {selectedConditions.length > 0 && (
              <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-6">Conditions Treated</h3>
                <div className="flex flex-wrap gap-2.5">
                  {selectedConditions.map(condition => (
                    <span key={condition} className="bg-[#efebe4] text-[var(--color-text-secondary)] px-4 py-2 rounded-full text-sm font-medium">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education */}
            {education.length > 0 && (
              <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] shadow-sm p-8 mb-6">
                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4">Education</h3>
                <ul className="space-y-3">
                  {education.map((edu, idx) => (
                    <li key={idx} className="text-[var(--color-text-secondary)] text-sm flex items-start gap-2">
                      <span className="text-[#4a9e7f] mt-1 text-[10px]">●</span>
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </>
      )}
    </div>
  );
}
