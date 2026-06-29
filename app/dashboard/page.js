"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Loading your health command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row relative">
      {/* Mobile Header */}
      <header className="lg:hidden bg-[#0D1B2A] text-white py-4 px-6 flex justify-between items-center z-20 border-b border-gray-800">
        <Link href="/dashboard" className="text-xl font-serif font-bold tracking-tight">
          Family Health<span className="text-blue-400">•</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop Sidebar + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0D1B2A] text-white flex flex-col justify-between p-6 border-r border-gray-800 z-40 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Logo */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/dashboard" className="text-2xl font-serif font-bold tracking-tight">
              Family Health<span className="text-blue-400">•</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </Link>

            <a
              href="#"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Family Members
            </a>

            <a
              href="#"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reminders
            </a>

            <a
              href="#"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Health Records
            </a>
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white uppercase flex-shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <h5 className="font-semibold text-sm truncate">{user?.fullName}</h5>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-900 text-red-200 hover:text-white py-3 rounded-lg text-sm font-medium transition-all cursor-pointer border border-red-800/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {logoutLoading ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">
              Welcome, {user?.fullName}!
            </h1>
            <p className="text-xs text-gray-500">Patient Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold border border-blue-100">
              Role: Patient
            </span>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 flex-1">
          {/* Welcome Alert Panel */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl lg:text-2xl font-serif font-bold text-gray-900 mb-2">
              This is patient dashboard page
            </h2>
            <p className="text-sm lg:text-base text-gray-600 max-w-xl">
              From here, you can view diagnostic reports, track daily medicines, configure active alerts, and ensure your family&apos;s records are completely updated.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block uppercase">Security Status</span>
                <span className="font-bold text-gray-900 text-base lg:text-lg">Active & Encrypted</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block uppercase">Linked Members</span>
                <span className="font-bold text-gray-900 text-base lg:text-lg">1 (Primary Patient)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block uppercase">WhatsApp Reminders</span>
                <span className="font-bold text-gray-900 text-base lg:text-lg">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
