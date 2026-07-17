'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    HeartPulse,
    Pill,
    Stethoscope,
    Search,
    Users,
    Activity,
    Settings,
    ChevronDown,
    Sparkles,
    Menu,
    Loader2,
    LogOut,
    Home,
    Calendar,
    UserCircle,
    HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [familyData, setFamilyData] = useState({
        familyName: 'Family Group',
        members: [],
    });
    const [userStorage, setUserStorage] = useState({
        used: 0,
        limit: 1,
        remaining: 1,
        percentageUsed: 0,
        plan: 'free',
    });

    const colorMap = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-red-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-500',
        'bg-cyan-500', 'bg-emerald-500', 'bg-fuchsia-500', 'bg-rose-500',
    ];

    const getColor = (index) => colorMap[index % colorMap.length];

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Calendar, label: 'My Appointments', href: '/appointments' },
        { icon: HeartPulse, label: 'Health Records', href: '/health-records' },
        { icon: Pill, label: 'Medicine Tracker', href: '/medicine-tracker' },
        { icon: Stethoscope, label: 'Doctor Visit Prep', href: '/doctor-visit' },
        { icon: Search, label: 'Find Doctors', href: '/find-doctors' },
        { icon: Users, label: 'Family Members', href: '/family-members' },
        { icon: UserCircle, label: 'My Profile', href: '/profile' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const profileRes = await fetch('/api/user/profile');
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();

            if (profileData.user?.activeFamilyId) {
                const familyId = profileData.user.activeFamilyId._id || profileData.user.activeFamilyId;
                const familyRes = await fetch(`/api/family/details?familyId=${familyId}`);
                if (familyRes.ok) {
                    const data = await familyRes.json();
                    setFamilyData({
                        familyName: data.family?.familyName || 'Family Group',
                        members: data.members || [],
                    });
                } else {
                    const membersRes = await fetch(`/api/family/members?familyId=${familyId}`);
                    if (membersRes.ok) {
                        const membersData = await membersRes.json();
                        setFamilyData(prev => ({ ...prev, members: membersData.members || [] }));
                    }
                }
            }

            await fetchUserStorage();

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStorage = async () => {
        try {
            const response = await fetch('/api/user/storage');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUserStorage({
                        used: data.data.storageUsed || 0,
                        limit: data.data.storageLimit || 1,
                        remaining: data.data.remainingStorage || 1,
                        percentageUsed: data.data.percentageUsed || 0,
                        plan: data.data.plan || 'free',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching storage:', error);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/login');
        }
    };

    const getDisplayMembers = () => {
        const members = familyData.members || [];
        const displayed = members.slice(0, 4).map(m => ({
            name: m.name,
            initial: m.name?.charAt(0).toUpperCase() || '?',
            color: getColor(members.indexOf(m)),
        }));
        if (members.length > 4) {
            displayed.push({ name: `+${members.length - 4}`, initial: `+${members.length - 4}`, color: 'bg-gray-500' });
        } else if (members.length === 0) {
            displayed.push({ name: 'Add members', initial: '+', color: 'bg-gray-650' });
        }
        return displayed;
    };

    const displayMembers = getDisplayMembers();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) setIsOpen(false);
    }, [pathname, isMobile]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && isOpen) {
                const sidebar = document.getElementById('sidebar');
                const hamburger = document.getElementById('hamburger-btn');
                if (sidebar && !sidebar.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    const getPlanDisplayName = (plan) => {
        const planNames = {
            free: 'Free Plan',
            family: 'Family Plan',
            premium: 'Premium Plan',
        };
        return planNames[plan] || 'Free Plan';
    };

    const getStorageBarColor = () => {
        const percentage = userStorage.percentageUsed;
        if (percentage > 90) return 'bg-red-500';
        if (percentage > 70) return 'bg-amber-500';
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0B1F4D] to-[#040D21] text-white">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">MedKept</span>
                    <div className="flex items-center gap-2 mt-3">
                        <h1 className="text-base font-bold text-white tracking-tight">
                            {loading ? 'Loading...' : familyData.familyName}
                        </h1>
                        <ChevronDown className="w-4 h-4 text-blue-300" />
                    </div>
                </div>

                <div className="mt-5 flex items-center -space-x-1.5">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                            <span className="text-xs text-blue-200/60">Loading members...</span>
                        </div>
                    ) : (
                        displayMembers.map((member, index) => (
                            <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${member.color} border-2 border-[#0B1F4D] shadow-md transition-transform hover:scale-110`}
                                title={member.name}
                            >
                                {member.initial}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
                <ul className="space-y-1.5">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                            : 'text-blue-100/70 hover:bg-white/5 hover:text-white hover:pl-5'
                                        } ${item.badge ? 'relative' : ''}`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                                    <span className="flex-1 text-sm">{item.label}</span>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${isActive ? 'bg-white text-blue-900' : 'text-blue-300 bg-blue-950/50 border border-blue-900'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Storage + Bottom Buttons */}
            <div className="p-5 border-t border-white/10 space-y-4 bg-black/20">
                {/* ─── User Storage Bar ─── */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                            <h3 className="text-xs font-bold text-blue-200">
                                {getPlanDisplayName(userStorage.plan)}
                            </h3>
                        </div>
                        <span className={`text-[10px] font-semibold ${
                            userStorage.percentageUsed > 90 ? 'text-red-400' :
                            userStorage.percentageUsed > 70 ? 'text-amber-400' :
                            'text-blue-300/80'
                        }`}>
                            {userStorage.used.toFixed(2)} GB / {userStorage.limit} GB
                        </span>
                    </div>
                    <div className="flex items-center justify-end">
                        <span className={`text-[9px] font-bold ${
                            userStorage.percentageUsed > 90 ? 'text-red-400' :
                            userStorage.percentageUsed > 70 ? 'text-amber-400' :
                            'text-blue-300/60'
                        }`}>
                            {userStorage.percentageUsed.toFixed(2)}% used
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getStorageBarColor()}`}
                            style={{ width: `${Math.min(userStorage.percentageUsed, 100)}%` }}
                        />
                    </div>
                    {userStorage.percentageUsed > 80 && (
                        <p className="text-[9px] text-amber-400/80 mt-1.5 font-medium">
                            ⚠️ {userStorage.remaining.toFixed(2)} GB remaining
                        </p>
                    )}
                </div>

                {/* Go to Homepage */}
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-100/70 hover:bg-white/5 hover:text-white hover:pl-5 transition-all duration-300 w-full"
                >
                    <Home className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-semibold">Go to Homepage</span>
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:pl-5 transition-all duration-300 w-full disabled:opacity-50 text-left cursor-pointer"
                >
                    {loggingOut ? (
                        <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                    ) : (
                        <LogOut className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-sm font-semibold">{loggingOut ? 'Logging out...' : 'Log Out'}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {!(isMobile && isOpen) && (
                <button
                    id="hamburger-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg hover:bg-gray-50 transition"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>
            )}

            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                id="sidebar"
                className={`w-[280px] h-screen bg-[#0D1B2A] border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40 shadow-xl transition-transform duration-300 ease-in-out ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;