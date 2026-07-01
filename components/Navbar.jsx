'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for auth token cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-[#FAF8F5]">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-serif font-bold text-gray-900 tracking-tight"
      >
        Family Health<span className="text-gray-900">•</span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Features
        </Link>
        <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          How it works
        </Link>
        <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Pricing
        </Link>
        <Link href="#corporates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          For Corporates
        </Link>
      </div>

      {/* CTA Buttons */}
      <div className="hidden md:flex items-center gap-3">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start free — no card needed
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-900">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
}
