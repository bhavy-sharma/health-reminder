// app/doctor/auth/page.jsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, X, FileText, Image, CheckCircle } from "lucide-react";

export default function DoctorAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin");
  const [signupStep, setSignupStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [medicalRegNo, setMedicalRegNo] = useState("");
  const [experience, setExperience] = useState("");
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState("");
  const [consultFee, setConsultFee] = useState("");
  
  // Certificate upload state
  const [certificate, setCertificate] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle certificate upload
  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous errors
    setCertificateError("");

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setCertificateError("Please upload JPEG, PNG, GIF, WEBP, or PDF files only.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("File size too large. Maximum size is 5MB.");
      return;
    }

    setCertificateUploading(true);

    // Create form data
    const formData = new FormData();
    formData.append("certificate", file);

    try {
      const response = await fetch("/api/doctor/auth/upload-certificate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Set certificate data
      setCertificate({
        url: data.data.url,
        publicId: data.data.publicId,
        fileName: data.data.fileName,
        fileType: data.data.fileType,
      });

      // Set preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setCertificatePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        // For PDFs, show a PDF icon
        setCertificatePreview("pdf");
      }

    } catch (err) {
      console.error("Upload error:", err);
      setCertificateError(err.message || "Failed to upload certificate");
      setCertificate(null);
      setCertificatePreview(null);
    } finally {
      setCertificateUploading(false);
    }
  };

  // Remove certificate
  const removeCertificate = () => {
    setCertificate(null);
    setCertificatePreview(null);
    setCertificateError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/doctor/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.error || "Login failed");

      router.push("/doctor/dashboard");
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate certificate
    if (!certificate) {
      setError("Please upload your medical practitioner certificate");
      setLoading(false);
      return;
    }

    // Prepare payload
    const payload = { 
      name, 
      email, 
      phone,
      specialty,
      medicalRegNo,
      experience: Number(experience),
      hospital,
      city,
      consultFee: Number(consultFee),
      password,
      medicalCertificate: certificate
    };

    try {
      const res = await fetch("/api/doctor/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || data.error || "Signup failed");

      router.push("/doctor/dashboard");
      router.refresh();
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const SPECIALTIES = [
    "Cardiologist",
    "Neurologist",
    "Orthopedic Surgeon",
    "Ophthalmologist",
    "Pediatrician",
    "Diabetologist",
    "Dermatologist",
    "Psychiatrist",
    "Gynecologist",
    "Urologist",
    "ENT Specialist",
    "General Physician",
    "Oncologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Nephrologist"
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Pane - Branding */}
      <div className="bg-[var(--color-navy)] text-white w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <Link href="/home" className="block">
              <h1 className="font-fraunces text-2xl font-bold hover:text-white/90 transition-colors">Family Health<span className="text-white">●</span></h1>
            </Link>
            <span className="bg-white/10 text-[var(--color-surface-secondary)] text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" className="hidden" /><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.5.5 0 0 0-.14.01" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>
              Doctor Portal
            </span>
          </div>

          <h2 className="font-fraunces text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Grow your practice.<br />
            <span className="text-[var(--color-sage-green)]">Reach more patients.</span>
          </h2>
          
          <p className="text-[var(--color-text-muted)] text-lg mb-12 max-w-md">
            Join thousands of verified doctors on India's most trusted family health platform.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl mt-1">📋</div>
              <div>
                <h3 className="font-bold text-white mb-1">Smart Appointment Management</h3>
                <p className="text-[var(--color-text-muted)] text-sm">View, confirm, and reschedule bookings from a single dashboard</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-2xl mt-1">⭐</div>
              <div>
                <h3 className="font-bold text-white mb-1">Patient Reviews & Ratings</h3>
                <p className="text-[var(--color-text-muted)] text-sm">Build trust with authentic reviews from real patients</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-2xl mt-1">🚀</div>
              <div>
                <h3 className="font-bold text-white mb-1">Premium Visibility Boost</h3>
                <p className="text-[var(--color-text-muted)] text-sm">Appear at the top of disease-specific searches near you</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-sage-green)] border-2 border-[var(--color-navy)]"></div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-warm-amber)] border-2 border-[var(--color-navy)]"></div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-pulse-red)] border-2 border-[var(--color-navy)]"></div>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">2,400+ verified doctors onboard</p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="bg-[var(--color-cream)] w-full md:w-1/2 p-8 md:p-16 flex flex-col relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          
          {/* Tabs */}
          <div className="flex bg-white/50 p-1 rounded-xl mb-12 border border-[var(--color-border)]">
            <button
              onClick={() => { setActiveTab("signin"); setSignupStep(1); setError(""); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${activeTab === "signin" ? "bg-white shadow-sm text-[var(--color-navy)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("create"); setError(""); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${activeTab === "create" ? "bg-white shadow-sm text-[var(--color-navy)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"}`}
            >
              Create Profile
            </button>
          </div>

          {error && (
            <div className="bg-[var(--color-danger-fill)] text-[var(--color-pulse-red)] p-3 rounded-lg text-sm font-medium mb-6 border border-[var(--color-pulse-red)]/20">
              {error}
            </div>
          )}

          {activeTab === "signin" ? (
            <div>
              <h2 className="font-fraunces text-3xl font-bold text-[var(--color-navy)] mb-2">Welcome back, Doctor</h2>
              <p className="text-[var(--color-text-muted)] mb-8">Sign in to your doctor dashboard</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Registered Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="doctor@example.com"
                    className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all pr-12 text-[var(--color-text-primary)]"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1 pb-4">
                  <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-sage-green)] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-navy)] text-white py-3.5 rounded-[var(--radius-input)] font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors disabled:opacity-70"
                >
                  {loading ? "Signing In..." : "Sign In to Dashboard"}
                  {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-[var(--color-text-muted)]">
                New doctor? <button onClick={() => { setActiveTab("create"); setError(""); }} className="text-[var(--color-navy)] font-semibold hover:underline">Create your profile</button>
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-fraunces text-3xl font-bold text-[var(--color-navy)]">
                  {signupStep === 1 ? "Create Doctor Profile" : "Practice Details"}
                </h2>
                <span className="bg-gray-100 text-[var(--color-text-muted)] px-3 py-1 rounded-full text-xs font-semibold">
                  Step {signupStep} / 2
                </span>
              </div>
              <p className="text-[var(--color-text-muted)] mb-8">
                {signupStep === 1 ? "Your basic professional details" : "Where you practice and your consultation fee"}
              </p>
              
              {signupStep === 1 ? (
                // Step 1 Form with Certificate Upload
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Full Name *</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Full Name" 
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Email *</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Phone *</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Specialty *</label>
                    <select 
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all appearance-none text-[var(--color-text-primary)]"
                    >
                      <option value="" disabled>Select your specialty</option>
                      {SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Medical Reg. No. *</label>
                      <input 
                        type="text" 
                        value={medicalRegNo}
                        onChange={(e) => setMedicalRegNo(e.target.value)}
                        placeholder="MCI-XXXX-YYYY" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Experience (yrs)</label>
                      <input 
                        type="number" 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="10" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                  </div>

                  {/* NEW: Medical Certificate Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">
                      Medical Practitioner Certificate *
                      <span className="text-[var(--color-text-muted)] font-normal text-xs ml-2">(JPEG, PNG, PDF - Max 5MB)</span>
                    </label>
                    
                    {/* Upload Area */}
                    <div 
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                        certificate ? 'border-[var(--color-sage-green)] bg-[var(--color-success-fill)]' : 
                        certificateError ? 'border-[var(--color-pulse-red)] bg-[var(--color-danger-fill)]' :
                        'border-[var(--color-border)] hover:border-[var(--color-navy)]/40 bg-white/50'
                      }`}
                    >
                      {!certificate ? (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                            onChange={handleCertificateUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={certificateUploading}
                          />
                          <div className="text-center">
                            <div className="flex justify-center mb-3">
                              <Upload className="w-10 h-10 text-[var(--color-text-muted)]" />
                            </div>
                            <p className="text-sm font-medium text-[var(--color-navy)]">
                              {certificateUploading ? "Uploading..." : "Click to upload or drag & drop"}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              Upload your medical registration certificate
                            </p>
                          </div>
                        </>
                      ) : (
                        // Uploaded file preview
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            {certificatePreview === "pdf" ? (
                              <FileText className="w-8 h-8 text-[var(--color-pulse-red)]" />
                            ) : certificatePreview ? (
                              <img 
                                src={certificatePreview} 
                                alt="Certificate preview" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Image className="w-8 h-8 text-[var(--color-text-muted)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-navy)] truncate">
                              {certificate.fileName}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-[var(--color-sage-green)] flex items-center gap-1">
                                <CheckCircle size={12} />
                                Uploaded successfully
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCertificate}
                            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-5 h-5 text-[var(--color-text-muted)] hover:text-[var(--color-pulse-red)]" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Error Message */}
                    {certificateError && (
                      <p className="text-xs text-[var(--color-pulse-red)] mt-1.5">
                        {certificateError}
                      </p>
                    )}
                    
                    {/* Uploading Indicator */}
                    {certificateUploading && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--color-navy)] rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Uploading to secure storage...</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      if(!name || !email || !specialty || !medicalRegNo) {
                        setError("Please fill all required fields to continue.");
                        return;
                      }
                      if(!certificate) {
                        setError("Please upload your medical practitioner certificate.");
                        return;
                      }
                      setError("");
                      setSignupStep(2);
                    }}
                    className="w-full bg-[var(--color-navy)] text-white py-3.5 mt-4 rounded-[var(--radius-input)] font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors"
                  >
                    Continue
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              ) : (
                // Step 2 Form (Same as before)
                <div className="space-y-4">
                  <div className="bg-[var(--color-success-fill)] text-[var(--color-sage-green)] px-4 py-3 rounded-lg border border-[var(--color-sage-green)]/30 flex items-center gap-2 text-sm font-medium mb-6">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                    Personal details & certificate saved — almost done!
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Hospital / Clinic Name</label>
                    <input 
                      type="text" 
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="Apollo Hospitals, Bandra" 
                      className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Consult Fee (₹)</label>
                      <input 
                        type="number" 
                        value={consultFee}
                        onChange={(e) => setConsultFee(e.target.value)}
                        placeholder="800" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all text-[var(--color-text-primary)]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-navy)] mb-1.5">Set Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters" 
                        className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20 transition-all pr-12 text-[var(--color-text-primary)]" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Password must be at least 8 characters
                    </p>
                  </div>
                  
                  <p className="text-xs text-[var(--color-text-muted)] mt-4 leading-relaxed">
                    By creating a profile, you agree that your information will be verified against the Medical Council of India registry before your listing goes live.
                  </p>

                  <div className="flex gap-4 mt-6">
                    <button 
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="w-1/3 bg-gray-100 text-[var(--color-text-secondary)] py-3.5 rounded-[var(--radius-input)] font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button 
                      type="button"
                      onClick={handleSignup}
                      disabled={loading}
                      className="w-2/3 bg-[var(--color-navy)] text-white py-3.5 rounded-[var(--radius-input)] font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2c42] transition-colors disabled:opacity-70"
                    >
                      {loading ? "Creating..." : "Create My Profile"}
                      {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}