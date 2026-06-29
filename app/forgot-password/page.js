"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-gray-200", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (score <= 3) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send verification code");
      setSuccessMsg(data.message);
      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the full 6-digit code.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");
      setResetToken(data.resetToken);
      setError("");
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password");
      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        {/* Enriched & slightly wider container card (max-w-6xl) */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

          {/* Left Side: Dark Navy Branding Panel */}
          <div className="hidden md:flex md:w-1/2 bg-[#0D1B2A] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
            <div>
              <span className="text-sm font-semibold tracking-wider text-blue-300 uppercase">
                Family Health Security
              </span>
              <h1 className="text-4xl font-serif font-bold mt-4 leading-tight">
                Reset your password securely.
              </h1>
              <p className="text-gray-300 mt-4 max-w-md leading-relaxed">
                We protect your medical and personal data. Follow the simple steps to recover your access safely.
              </p>
            </div>
            <div className="space-y-6 z-10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Security First</h4>
                  <p className="text-sm text-gray-400">All session resets use strict security keys and OTP verification.</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              © 2026 Family Health●. All rights reserved.
            </div>
          </div>

          {/* Right Side: Form Panel with wider max-w-lg container */}
          <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
            <div className="max-w-lg w-full mx-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm text-red-700 flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1 */}
              {step === "request" && (
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Forgot Password</h2>
                  <p className="text-gray-600 mb-8">
                    Enter your registered email address. We will send a 6-digit verification code to reset your password.
                  </p>
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002-2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-sm text-gray-900"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-950 transition-colors disabled:bg-gray-400 cursor-pointer"
                    >
                      {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="font-semibold text-gray-900 hover:underline inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === "otp" && (
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-gray-600 mb-6">
                    We&apos;ve sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>. Please enter it below.
                  </p>
                  {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-sm text-emerald-700 flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{successMsg}</span>
                    </div>
                  )}
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-gray-950"
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-950 transition-colors disabled:bg-gray-400 cursor-pointer"
                    >
                      Verify Code
                    </button>
                  </form>
                  <div className="mt-6 text-center text-sm">
                    {countdown > 0 ? (
                      <span className="text-gray-500">Resend code in {countdown}s</span>
                    ) : (
                      <button onClick={handleSendOtp} className="font-semibold text-gray-900 hover:underline focus:outline-none">
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === "reset" && (
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">New Password</h2>
                  <p className="text-gray-600 mb-8">Create a new secure password for your account.</p>
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="newPassword">New Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-sm text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {password && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Strength:</span>
                            <span className="font-semibold text-gray-900">{strength.label}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmNewPassword">Confirm New Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <input
                          id="confirmNewPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Repeat your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:border-transparent text-sm text-gray-900"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4 */}
              {step === "success" && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Success!</h2>
                  <p className="text-gray-600 mb-8">
                    Your password has been successfully updated. You can now log in using your new credentials.
                  </p>
                  <Link
                    href="/login"
                    className="w-full block bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors text-center"
                  >
                    Continue to Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
