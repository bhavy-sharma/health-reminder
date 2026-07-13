'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, UserCog, Stethoscope, UserPlus, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserRole(data?.user?.role || 'patient');
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const getDashboardLink = () => {
    if (userRole === 'admin') {
      return '/admin/overview';
    }
    if (userRole === 'doctor') {
      return '/doctor/dashboard';
    }
    return '/dashboard';
  };

  const getDashboardIcon = () => {
    if (userRole === 'admin') {
      return <UserCog className="w-4 h-4" />;
    }
    if (userRole === 'doctor') {
      return <Stethoscope className="w-4 h-4" />;
    }
    return <LayoutDashboard className="w-4 h-4" />;
  };

  const getDashboardLabel = () => {
    if (userRole === 'admin') {
      return 'Admin Dashboard';
    }
    if (userRole === 'doctor') {
      return 'Doctor Dashboard';
    }
    return 'Go to Dashboard';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-200 bg-[#FAF8F5]">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-serif font-bold text-gray-900 tracking-tight"
        >
          Family Health<span className="text-gray-900">•</span>
        </Link>

        {/* Desktop Navigation Links */}
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

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : isLoggedIn ? (
            <Link
              href={getDashboardLink()}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {getDashboardIcon()}
              {getDashboardLabel()}
            </Link>
          ) : (
            <>
              <Link
                href="/doctor"
                className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2.5 rounded-lg border border-emerald-200 hover:border-emerald-300"
              >
                <UserPlus className="w-4 h-4" />
                Register as Doctor
              </Link>
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
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-gray-200 px-4 py-4 space-y-4 animate-slide-down">
          {/* Mobile Nav Links */}
          <div className="flex flex-col space-y-3">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#corporates"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Corporates
            </Link>
          </div>

          {/* Mobile CTA Buttons */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
            {loading ? (
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : isLoggedIn ? (
              <Link
                href={getDashboardLink()}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {getDashboardIcon()}
                {getDashboardLabel()}
              </Link>
            ) : (
              <>
                <Link
                  href="/doctor"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-3 rounded-lg border border-emerald-200 hover:border-emerald-300 w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Register as Doctor
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 text-center w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gray-900 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors text-center w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start free — no card needed
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}